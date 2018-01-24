import _ from 'lodash'

import Storage from './storage'
import Parser from './parser'

import Entities from './providers/entities'
import LuisProvider from './providers/luis'

let storage
let provider

module.exports = {
  config: {
    intentsDir: { type: 'string', required: true, default: './intents', env: 'NLU_INTENTS_DIR' },
    entitiesDir: { type: 'string', required: true, default: './entities', env: 'NLU_ENTITIES_DIR' },

    // LUIS-specific config
    luisAppId: { type: 'string', required: false, default: '', env: 'NLU_LUIS_APP_ID' },
    luisProgrammaticKey: { type: 'string', required: false, default: '', env: 'NLU_LUIS_PROGRAMMATIC_KEY' },
    luisAppSecret: { type: 'string', required: false, default: '', env: 'NLU_LUIS_APP_SECRET' },
    luisAppRegion: { type: 'string', required: false, default: 'westus', env: 'NLU_LUIS_APP_REGION' }
  },

  init: async function(bp, configurator) {
    const config = await configurator.loadAll()
    storage = new Storage({ bp, config })
    await storage.initializeGhost()

    provider = new LuisProvider({
      logger: bp.logger,
      storage: storage,
      parser: new Parser(),
      kvs: bp.db.kvs,
      config: config
    })

    setTimeout(() => {
      provider.sync()
    }, 3000) // TODO Change that
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
  }
}
