import DB from './db'

// TODO: Cleanup old sessions
// TODO: If messages count > X, delete some
// TODO: Load / Save config

const config = {
  sessionExpiry: '3 days',
  paused: false
}

let db = null

const incomingMiddleware = (event, next) => {
  if (!db) { return next() }

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

module.exports = {
  init: function(bp) {

    bp.middlewares.register({
      name: 'hitl.captureMessages',
      type: 'incoming',
      order: 2,
      handler: incomingMiddleware,
      module: 'botpress-hitl',
      description: 'Captures incoming messages and if the session if paused, swallow the event.'
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

    // post /sessions/:id/typing
    // post /sessions/:id/message
    
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
