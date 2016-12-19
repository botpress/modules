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
    saveConfig(config, configFile)
  }

  const overrides = {}
  if (process.env.WIT_TOKEN) overrides.accessToken = process.env.WIT_TOKEN

  return Object.assign(JSON.parse(fs.readFileSync(configFile, 'utf-8')), overrides)
}

const incomingMiddleware = (event, next) => {
  if (event.type === 'message') {
    if (wit.mode === 'understanding') {
      wit.getEntities(event.user.id, event.text)
      .then(entities => {
        event.wit = { entities, context: wit.getUserContext(event.user.id) }
        next()
      })
    } else {
      wit.runActions(event.user.id, event.text)
      .then(() => {
        event.wit = { run: true, context: wit.getUserContext(event.user.id) }
      })
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
      wit.setConfiguration(loadConfig())
      res.sendStatus(200)
    })

    router.get("/entities", (req, res, next) => {
      
    })

    router.post("/actions", (req, res, next) => {
      
    })
  }
}
