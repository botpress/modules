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

  init: function(skin) {
    skin.db.get()
    .then(knex => {
      db = DB(knex, skin)
      return db.initializeDb()
      .then(() => analytics = new Analytics(skin, knex))
    })
  },

  ready: function(skin) {
    
    skin.getRouter("skin-analytics")
    .get("/graphs", (req, res, next) => {
      res.send(analytics.getChartsGraphData())
    })

    skin.getRouter('skin-analytics')
    .get('/metadata', (req, res, next) => {
      analytics.getAnalyticsMetadata()
      .then(metadata => res.send(metadata))
    })

  }
}
