import moment from 'moment'
import Promise from 'bluebird'

import DB from './db'

let knex = null
let skin = null

function scheduleToOutbox() {
  if (!knex) {
    return
  }

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
      const time = schedule.ts
        ? schedule.ts
        : moment('2016-11-15 07:15', 'YYYY-MM-DD HH:mm').format('x') + ' + (timezone * 3600)'

      return knex.raw(`insert into broadcast_outbox (userId, scheduleId, ts)
        select userId, ?, ?
        from (select timezone, id as userId from users)`, [schedule.id, knex.raw(time)])
      .then(() => {
        return knex('broadcast_schedules')
        .where({ id: schedule.id })
        .update({ outboxed: 1 }, '')
        .then(() => {
          return knex('broadcast_outbox')
          .where({ scheduleId: schedule.id })
          .select(knex.raw('count(*) as count'))
        })
        .then().get(0).then(({ count }) => {
          skin.logger.info('[broadcast] Scheduled broadcast #' 
          + schedule.id, '. [' + count + ' messages]')
        })
      })
    })
  })
}

module.exports = (s) => {

  // Exclusive locks
  let schedulingLock = false
  let sendingLock = false
  skin = s

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
