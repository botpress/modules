const Analytics = require('./analytics')
const fs = require('fs')
const path = require('path')

const loadDataFromFile = (file) => {
  if(!fs.existsSync(file)){
    console.log("Analytics file (" + file + ") doesn\'t exist.")
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"))
}

const saveDataToFile = (data, file) => {
  fs.writeFileSync(file, stringify(data))
}

module.exports = {
  ingoing: function(event, next) {

  },

  outgoing: function(event, next) {

  },

  init: function(skin) {

  },

  ready: function(skin) {
    const rawDatafile = path.join(skin.projectLocation, skin.botfile.dataDir, 'skin-analytics.raw.json')
    const chartsDatafile = path.join(skin.projectLocation, skin.botfile.dataDir, 'skin-analytics.charts.json')

    rawData = loadDataFromFile(rawDatafile);
    chartsData = loadDataFromFile(chartsDatafile)

    analytics = new Analytics(skin);

    skin.getRouter("skin-analytics")
    .get("/graphs", (req, res, next) => {
      res.send(analytics.getChartsGraphData())
    })

  }
}
