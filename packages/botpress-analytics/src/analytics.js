const fs = require('fs')
const path = require('path')
const EventEmitter = require('eventemitter2');
const _ = require('lodash')

const stats = require('./stats')

const createEmptyFileIfDoesntExist = (file) => {
  if(!fs.existsSync(file)) {
    fs.writeFileSync(file, '{}')
  }
}

const loadDataFromFile = (file) => {
  if(!fs.existsSync(file)){
    console.log("Analytics file (" + file + ") doesn\'t exist.")
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"))
}

class Analytics {
  constructor(skin) {
    if (!skin){
      throw new Error('You need to specify skin');
    }

    this.skin = skin
    this.chartsDatafile = path.join(skin.projectLocation, skin.botfile.dataDir, 'skin-analytics.charts.json')
    this.dbFile = path.join(skin.projectLocation, skin.botfile.dataDir, 'skin-analytics.sqlite')

    createEmptyFileIfDoesntExist(this.chartsDatafile)

    let running = false
    setInterval(() => {
      this.updateData()
    }, 30 * 1000 * 60)
    // }, 30 * 1000 * 60) // every 30min

    this.skin.events.on('data.update', () => { this.updateData() })
  }

  updateData(){
    console.log('Called')
    if(this.running) return

    this.running = true
    stats.getTotalUsers(this.dbFile)
    .then(data => this.savePartialData('totalUsers', data))
    .then(() => stats.getDailyActiveUsers(this.dbFile))
    .then(data => this.savePartialData('activeUsers', data))
    .then(() => stats.getDailyGender(this.dbFile))
    .then(data => this.savePartialData('genderUsage', data))
    .then(() => stats.getInteractionRanges(this.dbFile))
    .then(data => this.savePartialData('interactionsRange', data))
    .then(() => stats.getAverageInteractions(this.dbFile))
    .then(averageInteractions => {
      stats.getNumberOfUsers(this.dbFile)
      .then(nbUsers => {
        this.savePartialData('fictiveSpecificMetrics', {
          numberOfInteractionInAverage: averageInteractions,
          numberOfUsersToday: nbUsers.today,
          numberOfUsersYesterday: nbUsers.yesterday,
          numberOfUsersThisWeek: nbUsers.week
        })
      })
    })
    .then(() => stats.usersRetention(this.dbFile))
    .then(data => this.savePartialData('retentionHeatMap', data))
    .then(() => stats.getBusyHours(this.dbFile))
    .then(data => this.savePartialData('busyHoursHeatMap', data))
    .then(() => this.running = false)
    .then(() => {
      const data = this.getChartsGraphData()
      console.log("sending sent")
      this.skin.events.emit('data.send', data)
    })
  }

  savePartialData(property, data) {
    const chartsData = loadDataFromFile(this.chartsDatafile)
    chartsData[property] = data
    fs.writeFileSync(this.chartsDatafile, JSON.stringify(chartsData))
  }

  beta() {
    stats.getBusyHours(this.dbFile)
  }

  getChartsGraphData() {

    const chartsData = loadDataFromFile(this.chartsDatafile)

    if(_.isEmpty(chartsData)) {
      return {loading: true}
    }

    return {
      loading: false,
      totalUsersChartData: chartsData.totalUsers,
      activeUsersChartData: chartsData.activeUsers,
      genderUsageChartData: chartsData.genderUsage,
      typicalConversationLengthInADay: chartsData.interactionsRange,
      specificMetricsForLastDays: chartsData.fictiveSpecificMetrics,
      retentionHeatMap: chartsData.retentionHeatMap,
      busyHoursHeatMap: chartsData.busyHoursHeatMap
    }
  }
}

module.exports = Analytics;
