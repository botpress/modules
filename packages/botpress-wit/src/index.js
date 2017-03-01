import checkVersion from 'botpress-version-manager'

import path from 'path'
import fs from 'fs'

import Wit from './wit'

let wit = null

const incomingMiddleware = (event, next) => {
  if (event.type === 'message') {
    if (event.bp.wit.mode === 'understanding') {
      Object.assign(wit.getUserContext(event.user.id).context, {
        botpress_platform: event.platform,
        botpress_type: event.type
      })
      wit.getEntities(event.user.id, event.text)
      .then(entities => {
        event.wit = { entities, context: wit.getUserContext(event.user.id) }
        next()
      })
      .catch(err => next(err))
    } else {
      Object.assign(wit.getUserContext(event.user.id).context, {
        botpress_platform: event.platform,
        botpress_type: event.type
      })

      wit.runActions(event.user.id, event.text)
      .then(() => {
        event.wit = { run: true, context: wit.getUserContext(event.user.id) }
      })
      .catch(err => next(err))
    }
  } else {
    next()
  }
}

module.exports = {

  config: {
    accessToken: { type: 'string', required: true, env: 'WIT_TOKEN', default: '<YOUR TOKEN HERE>' },
    selectedMode: {
      type: 'choice',
      validation: ['understanding', 'stories'],
      required: true,
      default: 'understanding'
    }
  },

  init: function(bp, config) {
    checkVersion(bp, __dirname)
    
    wit = Wit(bp)

    bp.middlewares.register({
      name: 'wit.incoming',
      module: 'botpress-wit',
      type: 'incoming',
      handler: incomingMiddleware,
      order: 10,
      description: 'Understands entities from incoming message and suggests or executes actions.'
    })

    config.loadAll()
    .then(c => wit.setConfiguration(c))
  },

  ready: function(bp, config) {

    const router = bp.getRouter('botpress-wit')

    router.get('/config', (req, res) => {
      config.loadAll()
      .then(c => res.send(c))
    })

    router.post('/config', (req, res) => {
      const { accessToken, selectedMode } = req.body

      config.saveAll({ accessToken, selectedMode })
      .then(() => config.loadAll())
      .then(c => wit.setConfiguration(c))
      .then(() => res.sendStatus(200))
    })
  }
}
