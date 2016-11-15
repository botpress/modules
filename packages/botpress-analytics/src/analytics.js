const fs = require('fs')
const path = require('path')
const EventEmitter = require('eventemitter2');
const _ = require('lodash')
const moment = require('moment')

const Stats = require('./stats')

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
  constructor(skin, knex) {
    if (!skin){
      throw new Error('You need to specify skin');
    }

    this.skin = skin
    this.knex = knex
    this.stats = Stats(knex)
    this.chartsDatafile = path.join(skin.projectLocation, skin.botfile.dataDir, 'skin-analytics.charts.json')

    createEmptyFileIfDoesntExist(this.chartsDatafile)

    let running = false
    setInterval(() => {
      this.stats.getLastRun()
      .then(ts => {
        const run = moment(new Date(ts))
        const then = moment(new Date()).subtract(30, 'min')
        const elasped = moment.duration(then.diff(run)).asMinutes()
        if(!ts || elasped >= this.getUpdateFrequency()) {
          this.updateData()
        }
      })
    }, 5000)
  }

  getDBSize() {
    return fs.statSync(this.skin.db.location)['size'] / 1000000.0 // in megabytes
  }

  getAnalyticsMetadata() {
    return this.stats.getLastRun()
    .then(ts => {
      const run = moment(new Date(ts))
      const then = moment(new Date()).subtract(30, 'min')
      const elasped = moment.duration(then.diff(run)).humanize()
      return { lastUpdated: elasped, size: this.getDBSize() }
    })
  }

  getUpdateFrequency() {
    return this.getDBSize() < 5 ? 5 : 60
  }

  updateData() {
    if(this.running) return
    this.running = true
    this.skin.logger.debug('skin-analytics: recompiling analytics')
    this.stats.getTotalUsers()
    .then(data => this.savePartialData('totalUsers', data))
    .then(() => this.stats.getDailyActiveUsers())
    .then(data => this.savePartialData('activeUsers', data))
    .then(() => this.stats.getDailyGender())
    .then(data => this.savePartialData('genderUsage', data))
    .then(() => this.stats.getInteractionRanges())
    .then(data => this.savePartialData('interactionsRange', data))
    .then(() => this.stats.getAverageInteractions())
    .then(averageInteractions => {
      this.stats.getNumberOfUsers()
      .then(nbUsers => {
        this.savePartialData('fictiveSpecificMetrics', {
          numberOfInteractionInAverage: averageInteractions,
          numberOfUsersToday: nbUsers.today,
          numberOfUsersYesterday: nbUsers.yesterday,
          numberOfUsersThisWeek: nbUsers.week
        })
      })
    })
    .then(() => this.stats.usersRetention())
    .then(data => this.savePartialData('retentionHeatMap', data))
    .then(() => this.stats.getBusyHours())
    .then(data => this.savePartialData('busyHoursHeatMap', data))
    .then(() => {
      const data = this.getChartsGraphData()
      this.skin.events.emit('data.send', data)
      this.stats.setLastRun()
    })
    .then(() => this.running = false)
  }

  savePartialData(property, data) {
    const chartsData = loadDataFromFile(this.chartsDatafile)
    chartsData[property] = data
    fs.writeFileSync(this.chartsDatafile, JSON.stringify(chartsData))
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
