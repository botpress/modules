import moment from 'moment'
import Promise from 'bluebird'

import DB from './db'

let knex = null

function scheduleToOutbox() {
  if (!knex) {
    return
  }

  console.log('>> running schedule to outbox')

  knex('broadcast_schedules')
  .where({ outboxed: 0 })
  .andWhere(function() {
    this.where(function() {
      this.whereNotNull('ts')
      .andWhere(knex.raw("julianday('now', '+5 minutes') >= julianday(ts/1000, 'unixepoch')"))
    })
    .orWhere(function() {
      this.whereNull('ts')
      .andWhere(knex.raw("julianday('now', '+14 hours', '+5 minutes') >= julianday(date_time)"))
    })
  })
  .then(schedules => {
    return Promise.map(schedules, (schedule) => {
      const userTz = !schedule.ts
      console.log('>>> SCHEDULE: ', schedule, userTz)
    })
  })
}

module.exports = (skin) => {

  // Exclusive locks
  let schedulingLock = false
  let sendingLock = false

  skin.db.get()
  .then(k => {
    const { initialize } = DB(k)
    knex = k
    initialize()
  })

  setInterval(scheduleToOutbox, 5 * 1000)

  setInterval(() => {

  }, 120 * 1000)

}

// SCHEDULING (Every 1m) --> Exclusive lock
// TODO Look for outboxed + near or past
// outbox them with good timezone

// SENDING (every 1m) --> Exclusive lock
// TODO Look for past outboxed
// Send them