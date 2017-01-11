import path from 'path'
import fs from 'fs'

import axios from 'axios'

let configFile = null

let service = null

const saveConfig = config => {
  fs.writeFileSync(configFile, JSON.stringify(config))
}

const loadConfig = () => {
  if (!fs.existsSync(configFile)) {
    const config = { accessToken : '', lang: 'en' }
    saveConfig(config, configFile)
  }

  const overrides = {}
  if (process.env.APIAI_TOKEN) overrides.accessToken = process.env.APIAI_TOKEN

  return Object.assign(JSON.parse(fs.readFileSync(configFile, 'utf-8')), overrides)
}

const setService = () => {
  const config = loadConfig()
  
  const client = axios.create({
    baseURL: 'https://api.api.ai/v1',
    timeout: 5000,
    headers: {'Authorization': 'Bearer ' + config.accessToken}
  })

  service = (userId, text) => {
    return client.post('/query?v=20170101', {
      query: text,
      lang: config.lang,
      sessionId: userId
    })
  }
}

const incomingMiddleware = (event, next) => {
  if (event.type === 'message') {
    service(event.user.id, event.text)
    .then(({data}) => {
      event.nlp = data.result
      next()
    })
    .catch(err => {
      event.bp.logger.warn('botpress-wit.ai', 'API Error. Could not process incoming text: ', err.message)
      next()
    })
  } else {
    next()
  }
}

module.exports = {
  init: function(bp) {
    configFile = path.join(bp.projectLocation, bp.botfile.modulesConfigDir, 'botpress-apiai.json')
    setService()

    bp.middlewares.register({
      name: 'apiai.incoming',
      module: 'botpress-api.ai',
      type: 'incoming',
      handler: incomingMiddleware,
      order: 10,
      description: 'Process natural language in the form of text. Structured data with an action and parameters for that action is injected in the incoming message event.'
    })
  },
  ready: function(bp) {
    const router = bp.getRouter('botpress-apiai')

    router.get('/config', (req, res) => {
      res.send(loadConfig())
    })

    router.post('/config', (req, res) => {
      const { accessToken, lang } = req.body
      saveConfig({ accessToken, lang })
      setService()
      res.sendStatus(200)
    })
  }
}
