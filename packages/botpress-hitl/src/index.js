import DB from './db'
import _ from 'lodash'
import path from 'path'
import fs from 'fs'

// TODO: Cleanup old sessions
// TODO: If messages count > X, delete some

let db = null
let configFile = null
let config = { }

const saveConfig = config => {
  fs.writeFileSync(configFile, JSON.stringify(config))
}

const loadConfig = () => {
  if (!fs.existsSync(configFile)) {
    const config = { sessionExpiry: '3 days', paused: false }
    saveConfig(config, configFile)
  }

  return Object.assign(JSON.parse(fs.readFileSync(configFile, 'utf-8')))
}

const incomingMiddleware = (event, next) => {
  if (!db) { return next() }

  if (_.includes(['delivery', 'read'], event.type)) {
    return next()
  }

  return db.getUserSession(event)
  .then(session => {

    if (session.is_new_session) {
      event.bp.events.emit('hitl.session', session)
    }

    return db.appendMessageToSession(event, session.id, 'in')
    .then(message => {

      event.bp.events.emit('hitl.message', message)

      if (!!session.paused || config.paused) {
        event.bp.logger.debug('[hitl] Session paused, message swallowed:', event.text)
        // the session or bot is paused, swallow the message
        return
      } else {
        next()
      }
    })
  })
}

const outgoingMiddleware = (event, next) => {
  if (!db) { return next() }

  return db.getUserSession(event)
  .then(session => {

    if (session.is_new_session) {
      event.bp.events.emit('hitl.session', session)
    }

    return db.appendMessageToSession(event, session.id, 'out')
    .then(message => {
      event.bp.events.emit('hitl.message', message)
      next()
    })
  })
}

module.exports = {
  init: function(bp) {
    configFile = path.join(bp.projectLocation, bp.botfile.modulesConfigDir, 'botpress-hitl.json')
    config = loadConfig()

    bp.middlewares.register({
      name: 'hitl.captureInMessages',
      type: 'incoming',
      order: 2,
      handler: incomingMiddleware,
      module: 'botpress-hitl',
      description: 'Captures incoming messages and if the session if paused, swallow the event.'
    })

    bp.middlewares.register({
      name: 'hitl.captureOutMessages',
      type: 'outgoing',
      order: 50,
      handler: outgoingMiddleware,
      module: 'botpress-hitl',
      description: 'Captures outgoing messages to show inside HITL.'
    })

    bp.db.get()
    .then(knex => db = DB(knex))
    .then(() => db.initialize())
  },
  ready: function(bp) {

    bp.hitl = {
      pause: (platform, userId) => db.setSessionPaused(true, platform, userId, 'code'),
      unpause: (platform, userId) => db.setSessionPaused(false, platform, userId, 'code')
    }

    const router = bp.getRouter('botpress-hitl')

    router.get('/sessions', (req, res) => {
      db.getAllSessions(!!req.query.onlyPaused)
      .then(sessions => res.send(sessions))
    })

    router.get('/sessions/:sessionId', (req, res) => {
      db.getSessionData(req.params.sessionId)
      .then(messages => res.send(messages))
    })

    router.post('/sessions/:sessionId/message', (req, res) => {
      const { message } = req.body

      db.getSession(req.params.sessionId)
      .then(session => {
        const event = {
          type: 'text',
          platform: session.platform,
          raw: { to: session.userId, message: message },
          text: message
        }

        bp.middlewares.sendOutgoing(event)
      })
    })

    // TODO post /sessions/:id/typing
    
    router.post('/sessions/:sessionId/pause', (req, res) => {
      db.setSessionPaused(true, null, null, 'operator', req.params.sessionId)
      .then(res.sendStatus(200))
    })

    router.post('/sessions/:sessionId/unpause', (req, res) => {
      db.setSessionPaused(false, null, null, 'operator', req.params.sessionId)
      .then(res.sendStatus(200))
    })
  }
}
