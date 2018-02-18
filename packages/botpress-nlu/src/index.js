import _ from 'lodash'
import retry from 'bluebird-retry'

import Storage from './storage'
import Parser from './parser'

import Entities from './providers/entities'

import LuisProvider from './providers/luis'
import RasaProvider from './providers/rasa'

let storage
let provider

module.exports = {
  config: {
    intentsDir: { type: 'string', required: true, default: './intents', env: 'NLU_INTENTS_DIR' },
    entitiesDir: { type: 'string', required: true, default: './entities', env: 'NLU_ENTITIES_DIR' },

    // Provider config
    provider: { type: 'string', required: true, default: 'LUIS', env: 'NLU_PROVIDER' },

    // LUIS-specific config
    luisAppId: { type: 'string', required: false, default: '', env: 'NLU_LUIS_APP_ID' },
    luisProgrammaticKey: { type: 'string', required: false, default: '', env: 'NLU_LUIS_PROGRAMMATIC_KEY' },
    luisAppSecret: { type: 'string', required: false, default: '', env: 'NLU_LUIS_APP_SECRET' },
    luisAppRegion: { type: 'string', required: false, default: 'westus', env: 'NLU_LUIS_APP_REGION' },

    // RASA-specific config
    rasaEndpoint: { type: 'string', required: false, default: 'http://localhost:5000', env: 'NLU_RASA_URL' },
    rasaToken: { type: 'string', required: false, default: '', env: 'NLU_RASA_TOKEN' },
    rasaProject: { type: 'string', required: false, default: 'botpress', env: 'NLU_RASA_PROJECT' }
  },

  init: async function(bp, configurator) {
    const config = await configurator.loadAll()
    storage = new Storage({ bp, config })
    await storage.initializeGhost()

    const Provider = {
      luis: LuisProvider,
      rasa: RasaProvider
    }[config.provider.toLowerCase()]

    if (!Provider) {
      throw new Error(`Unknown NLU provider "${config.provider}"`)
    }

    provider = new Provider({
      logger: bp.logger,
      storage: storage,
      parser: new Parser(),
      kvs: bp.db.kvs,
      config: config
    })

    const retryPolicy = {
      interval: 100,
      max_interval: 500,
      timeout: 5000,
      max_tries: 3
    }

    async function incomingMiddleware(event, next) {
      try {
        const metadata = await retry(() => provider.extract(event), retryPolicy)
        if (metadata) {
          Object.assign(event, { nlu: metadata })
        }
      } catch (err) {
        bp.logger.warn('[NLU] Error extracting metadata for incoming text: ' + err.message)
      }

      _.merge(event, {
        nlu: {
          intent: {
            is: intentName =>
              (_.get(event, 'nlu.intent.name') || '').toLowerCase() === (intentName && intentName.toLowerCase())
          }
        }
      })
      next()
    }

    bp.middlewares.register({
      name: 'nlu.incoming',
      module: 'botpress-nlu',
      type: 'incoming',
      handler: incomingMiddleware,
      order: 10,
      description:
        'Process natural language in the form of text. Structured data with an action and parameters for that action is injected in the incoming message event.'
    })

    setTimeout(() => {
      provider.sync()
    }, 500) // TODO Change that
  },

  ready: async function(bp) {
    const router = bp.getRouter('botpress-nlu')

    router.delete('/intents/:intent', async (req, res) => {
      await storage.deleteIntent(req.params.intent)
      res.sendStatus(200)
    })

    router.post('/intents/:intent', async (req, res) => {
      await storage.saveIntent(req.params.intent, req.body && req.body)
      res.sendStatus(200)
    })

    router.get('/intents', async (req, res) => {
      res.send(await storage.getIntents())
    })

    router.get('/intents/:intent', async (req, res) => {
      res.send(await storage.getIntent(req.params.intent))
    })

    router.get('/entities', async (req, res) => {
      res.send((await provider.getAvailableEntities()).map(x => x.name))
    })

    router.get('/sync/check', async (req, res) => {
      res.send(await provider.checkSyncNeeded())
    })
  }
}
