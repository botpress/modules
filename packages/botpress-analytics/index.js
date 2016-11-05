const Analytics = require('./analytics')

module.exports = {
  ingoing: function(event, next) {

  },
  outgoing: function(event, next) {

  },
  init: function(skin) {

  },
  ready: function(skin) {

    analytics = new Analytics(skin);

    skin.getRouter("skin-analytics")
    .get("/graphs", (req, res, next) => {
      res.send(analytics.getGraphsData())
    })
  }
}
