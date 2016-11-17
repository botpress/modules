const Analytics = require('./analytics')
const DB = require('./db')

let analytics = null
let db = null

module.exports = {
  incoming: function(event, next) {
    if (event.user) {
      db && db.saveIncoming(event)
      .then(() => next())
    } else {
      next()
    }
  },

  outgoing: function(event, next) {
    db && db.saveOutgoing(event)
    next()
  },

  init: function(bp) {
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
