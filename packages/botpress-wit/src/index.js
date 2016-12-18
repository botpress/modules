import path from 'path'
import fs from 'fs'

import wit from './wit'

let configFile = null

const saveConfig = (config) => {
  fs.writeFileSync(configFile, JSON.stringify(config))
}

const loadConfig = () => {
  if (!fs.existsSync(configFile)) {
    const config = { accessToken : '', selectedMode: 'understanding' }
    saveConfig(config,file)
  }

  const overrides = {}
  if (process.env.WIT_TOKEN) overrides.accessToken = process.env.WIT_TOKEN

  return Object.assign(JSON.parse(fs.readFileSync(configFile, 'utf-8')), overrides)
}

const incomingMiddleware = (event, next) => {
  if (event.type === 'message') {
    if (wit.mode === 'understanding') {
      wit.getEntities(event.user.id, event.text)
      .then((entities) => {
        //console.log(entities)
      })
    } else {
      wit.runActions(event.user.id, event.text)
    }
  } else {
    next()
  }
}

module.exports = {
  init: function(bp) {
    configFile = path.join(bp.projectLocation, bp.botfile.modulesConfigDir, 'botpress-wit.json')

    bp.middlewares.register({
      name: 'wit.incoming',
      module: 'botpress-wit',
      type: 'incoming',
      handler: incomingMiddleware,
      order: 10,
      description: 'Understands entities from incoming message and suggests or executes actions.'
    })

    wit.setConfiguration(loadConfig())
  },

  ready: function(bp) {

    const router = bp.getRouter('botpress-wit')

    router.get('/config', (req, res) => {
      res.send(loadConfig())
    })

    router.post('/config', (req, res) => {
      const { accessToken, selectedMode } = req.body
      saveConfig({ accessToken, selectedMode })
      res.sendStatus(200)
    })

    router.get("/entities", (req, res, next) => {
      // TODO: req message and return entities


    })

    router.get("/actions", (req, res, next) => {
      // TODO: req message and return entities

    })
  }
}
