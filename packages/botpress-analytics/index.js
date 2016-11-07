const Analytics = require('./analytics')
let analytics = null

module.exports = {
  incoming: function(event, next) {
    db.saveIncoming(event)
    next()
  },

  outgoing: function(event, next) {
    db.saveOutgoing(event)
    next()
  },

  init: function(skin) {
    analytics = new Analytics(skin)
    analytics.beta()
  },

  ready: function(skin) {
    
    skin.getRouter("skin-analytics")
    .get("/graphs", (req, res, next) => {
      res.send(analytics.getChartsGraphData())
    })

  }
}
