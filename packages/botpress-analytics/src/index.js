const Analytics = require('./analytics')
const DB = require('./db')
const _ = require('lodash')

let analytics = null
let db = null

const interactionsToTrack = [
  'message', 
  'text', 
  'button', 
  'template', 
  'quick_reply', 
  'postback'
]

const incomingMiddleware = (event, next) => {
  if (!_.includes(interactionsToTrack, event.type)) {
    return next()
  }

  if (event.user) {
    db && db.saveIncoming(event)
    .then(() => next())
  } else {
    next()
  }
}

const outgoingMiddleware = (event, next) => {
  if (!_.includes(interactionsToTrack, event.type)) {
    return next()
  }

  db && db.saveOutgoing(event)
  next()
}

module.exports = {
  init: function(bp) {

    bp.middlewares.register({
      name: 'analytics.incoming',
      module: 'botpress-analytics',
      type: 'incoming',
      handler: incomingMiddleware,
      order: 5,
      description: 'Tracks incoming messages for Analytics purposes'
    })

    bp.middlewares.register({
      name: 'analytics.outgoing',
      module: 'botpress-analytics',
      type: 'outgoing',
      handler: outgoingMiddleware,
      description: 'Tracks outgoing messages for Analytics purposes'
    })

    bp.db.get()
    .then(knex => {
      db = DB(knex, bp)
      return db.initializeDb()
      .then(() => analytics = new Analytics(bp, knex))
    })
  },

  ready: function(bp) {
    
    bp.getRouter("botpress-analytics")
    .get("/graphs", (req, res, next) => {
      res.send(analytics.getChartsGraphData())
    })

    bp.getRouter('botpress-analytics')
    .get('/metadata', (req, res, next) => {
      analytics.getAnalyticsMetadata()
      .then(metadata => res.send(metadata))
    })

  }
}
