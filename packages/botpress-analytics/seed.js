const _ = require('lodash')
const moment = require('moment')
const db = require('./db')
const Promise = require('bluebird')
const fs = require('fs')

const dbFile = process.env.DB_PATH || './seed.sqlite'
const daysBack = 7
const initialNumberOfUsers = 10000
const interactionsPerDay = 20000
const retentionRate = 0.88
const growthRate = 0.12
const platforms = ['facebook', 'slack', 'kik']
const distribution = {
  1: 5,
  2: 5,
  3: 5,
  4: 7,
  5: 10,
  6: 10,
  7: 20,
  8: 30,
  9: 55,
  10: 20,
  11: 20,
  12: 30,
  13: 35,
  14: 23,
  15: 20,
  16: 50,
  17: 55,
  18: 60,
  19: 40,
  20: 30,
  21: 25,
  22: 20,
  23: 9,
  24: 8
}

const users = []


const dropUsers = (count) => {
  count = parseInt(count)
  const removeAt = _.uniq(_.times(count, () => _.random(0, users.length)))
  _.pullAt(users, removeAt)
  console.log('Removed ~', count, 'users')
}

const addUsers = (count, knex, date) => {
  count = parseInt(count)
  const rows = []
  for(var i = 0; i < count; i++) {
    const platform = _.sample(platforms)
    const gender = Math.random() < 0.65 ? 'male' : 'female'
    const id = _.uniqueId()
    const locale = _.sample(['en_US', 'fr_CA', 'en_CA'])

    const user = {
      id: platform + ':' + id,
      userId: id,
      platform: platform,
      gender: gender,
      timezone: _.random(-6, 12, false),
      locale: locale,
      created_on: date
    }

    users.push(user)
    rows.push(user)
  }

  return knex.batchInsert('users', rows, 20)
  .then(() => console.log('Added', count, 'users'))
}

const run = (knex) => {
  const interactions = []
  const startDate = moment(new Date()).subtract(daysBack, 'days').format('x')
  return addUsers(initialNumberOfUsers, knex, startDate)
  .then(() => {
    return Promise.mapSeries(_.times(daysBack, Number), (day) => {
      const i = daysBack - day
      let count = 0
      const target = interactionsPerDay + _.random(-0.1 * interactionsPerDay, 0.1 * interactionsPerDay, false)
      while(count < target) {
        const hour = _.random(0, 23, false)
        if(Math.random() > distribution[hour] / 100) {
          continue
        }
        const time = moment(new Date()).subtract(i, 'days').startOf('day').add(hour, 'hours')
        const direction = Math.random() > 0.70 ? 'in' : 'out'
        const user = _.sample(users)
        interactions.push({
          ts: time.format('x'),
          type: 'text',
          text: 'Random',
          user: user.id,
          direction: direction
        })
        count++
      }
      dropUsers((1 - retentionRate) * users.length)
      const addDate = moment(new Date()).subtract(i, 'days').format('x')
      return addUsers(users.length * growthRate, knex, addDate)
    })
  })
  .then(() => {
    return knex.batchInsert('interactions', interactions, 20)
    .then(() => console.log('Added', interactions.length, 'interactions'))
  })
  .then(() => console.log('ALL DONE'))
}

if(fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile)  
}

db.getOrCreate(dbFile)
.then((knex) => {
  return run(knex)
})
.then(() => process.exit(0))
