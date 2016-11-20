const Analytics = require('./analytics')
const DB = require('./db')

let analytics = null
let db = null

const incomingMiddleware = (event, next) => {
  if (event.user) {
    db && db.saveIncoming(event)
    .then(() => next())
  } else {
    next()
  }
}

const outgoingMiddleware = (event, next) => {
  db && db.saveOutgoing(event)
  next()
}

module.exports = {
  init: function(bp) {

    bp.registerMiddleware({
      name: 'analytics.incoming',
      module: 'botpress-analytics',
      type: 'incoming',
      handler: incomingMiddleware,
      description: 'Tracks incoming messages for Analytics purposes'
    })

    bp.registerMiddleware({
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
