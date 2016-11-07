const EventEmitter = require('eventemitter2');

class Analytics extends EventEmitter {
  constructor(skin) {
    super();

    if (!skin){
      throw new Error('You need to specify skin');
    }

    this.app = skin.getRouter('skin-analytics');

    this.fictiveDataForTotalUsers = [
      //Last 10 important moments + total of users
      {name: 'Dec', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Jan', facebook: 600, slack: 2400, kik: 2400},
      {name: 'Feb', facebook: 800, slack: 2400, kik: 2400},
      {name: 'Apr', facebook: 1000, slack: 2400, kik: 2400},
      {name: 'May', facebook: 2000, slack: 2400, kik: 2400},
      {name: 'Jun', facebook: 3000, slack: 1398, kik: 2210},
      {name: 'Jul', facebook: 5000, slack: 9800, kik: 2290},
      {name: 'Aug', facebook: 7000, slack: 3908, kik: 2000},
      {name: 'Sept', facebook: 7000, slack: 4800, kik: 2181},
      {name: 'Oct', facebook: 10000, slack: 3800, kik: 2500},
      {name: 'Nov', facebook: 14000, slack: 4300, kik: 2100},
    ]

    this.fictiveActiveUsersData = [
      //Last 30 days + active users
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Jan', facebook: 600, slack: 2400, kik: 2400},
      {name: 'Feb', facebook: 800, slack: 2400, kik: 2400},
      {name: 'Apr', facebook: 1000, slack: 2400, kik: 2400},
      {name: 'May', facebook: 2000, slack: 2400, kik: 2400},
      {name: 'Jun', facebook: 3000, slack: 1398, kik: 2210},
      {name: 'Jul', facebook: 5000, slack: 9800, kik: 2290},
      {name: 'Aug', facebook: 7000, slack: 3908, kik: 2000},
      {name: 'Sept', facebook: 7000, slack: 4800, kik: 2181},
      {name: 'Oct', facebook: 10000, slack: 3800, kik: 2500},
      {name: 'Nov', facebook: 14000, slack: 4300, kik: 2100},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400},
      {name: 'Date', facebook: 400, slack: 2400, kik: 2400}
    ]

    this.fictiveGenderUsageData = [
      //Last 7 days + active users
      {name: 'Date', male: 400, female: 2400},
      {name: 'Date', male: 2400, female: 700},
      {name: 'Date', male: 400, female: 700},
      {name: 'Date', male: 2400, female: 2400},
      {name: 'Date', male: 700, female: 700},
      {name: 'Date', male: 2400, female: 2400},
      {name: 'Date', male: 400, female: 700},
      {name: 'Date', male: 400, female: 2400}
    ]

    this.fictiveConversationData = [
      {name: '[0-5]', percentage: 0.253},
      {name: '[6-10]', percentage: 0.102},
      {name: '[11-15]', percentage: 0.124},
      {name: '[16-20]', percentage: 0.075},
      {name: '[21-30]', percentage: 0.335},
      {name: '[31-50]', percentage: 0.072},
      {name: '[51-100]', percentage: 0.058}
    ]

    this.fictiveSpecificMetrics = {
      numberOfInteractionInAverage: 12.4,
      numberOfUsersToday: 234,
      numberOfUsersYesterday: 5234,
      numberOfUsersThisWeek: 20232
    }

    this.fictiveRetentionHeatMap = {
      'Oct 31': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1],
      'Oct 30': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, null],
      'Oct 29': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1],
      'Oct 28': [1.0, 0.9, 0.8, 0.7, 0.4, 0.9, 0.1],
      'Oct 27': [1.0, 0.9, 0.8, 0.7, null, 0.3, 0.1],
      'Oct 26': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1],
      'Oct 25': [1.0, 0.9, 0.8, 0.7, 0.4, 0.9, 1.0],
      'Oct 24': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1]
    }

    this.fictiveBusyHour = {
      'Oct 31': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 30': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 29': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 28': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 27': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 26': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 25': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 24': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
    }

    this.chartsGraphData = {
      totalUsersChartData: this.fictiveDataForTotalUsers,
      activeUsersChartData: this.fictiveActiveUsersData,
      genderUsageChartData: this.fictiveGenderUsageData,
      typicalConversationLengthInADay: this.fictiveConversationData,
      specificMetricsForLastDays: this.fictiveSpecificMetrics,
      retentionHeatMap: this.fictiveRetentionHeatMap,
      busyHoursHeatMap: this.fictiveBusyHour
    }
  }

  getChartsGraphData(){
    return this.chartsGraphData
  }
}

module.exports = Analytics;
