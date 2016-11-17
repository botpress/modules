import moment from 'moment'
import Promise from 'bluebird'
import _ from 'lodash'

import DB from './db'

let knex = null
let skin = null

let schedulingLock = false
let sendingLock = false

const intervalBase = process.env.NODE_ENV === 'production'
  ? 60 * 1000
  : 1000

const emitChanged = _.throttle(() => {
  skin && skin.events.emit('broadcast.changed')
}, 1000)

function scheduleToOutbox() {
  if (!knex || schedulingLock) {
    return
  }

  schedulingLock = true
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
        : moment(schedule.date_time + 'Z', 'YYYY-MM-DD HH:mm').format('x') + ' + (timezone * 3600)'

      return knex.raw(`insert into broadcast_outbox (userId, scheduleId, ts)
        select userId, ?, ?
        from (select timezone, id as userId from users)`, [schedule.id, knex.raw(time)])
      .then(() => {
        return knex('broadcast_outbox')
        .where({ scheduleId: schedule.id })
        .select(knex.raw('count(*) as count'))
        .then().get(0).then(({ count }) => {
          return knex('broadcast_schedules')
          .where({ id: schedule.id })
          .update({ outboxed: 1, total_count: count }) 
          .then(() => {
            skin.logger.info('[broadcast] Scheduled broadcast #' 
            + schedule.id, '. [' + count + ' messages]')

            emitChanged()
          })
        })
      })
    })
  })
  .finally(() => {
    schedulingLock = false
  })
}

function sendBroadcasts() {
  if (!knex || sendingLock) {
    return
  }

  sendingLock = true

  knex('broadcast_outbox')
  .where(knex.raw("julianday(broadcast_outbox.ts/1000, 'unixepoch') <= julianday('now')"))
  .join('users', 'users.id', 'broadcast_outbox.userId')
  .join('broadcast_schedules', 'scheduleId', 'broadcast_schedules.id')
  .limit(1000)
  .select([
    'users.userId as userId',
    'users.platform as platform',
    'broadcast_schedules.text as text',
    'broadcast_schedules.type as type',
    'broadcast_schedules.id as scheduleId',
    'broadcast_outbox.ts as sendTime',
    'broadcast_outbox.userId as scheduleUser'
  ])
  .then(rows => {
    return Promise.mapSeries(rows, row => {
      if (row.type === 'text') {
        skin.outgoing({
          platform: row.platform,
          type: 'text',
          text: row.text,
          raw: {
            to: row.userId,
            message: row.text
          }
        })
      } else {
        const fn = new Function('skin', 'userId', 'platform', row.text)
        fn(skin, row.userId, row.platform)
      }

      return knex('broadcast_outbox')
      .where({ userId: row.scheduleUser, scheduleId: row.scheduleId })
      .delete()
      .then(() => {
        knex('broadcast_schedules')
        .where({ id: row.scheduleId })
        .update({ sent_count: knex.raw('sent_count + 1') })
        .then(() => emitChanged())
      })
    })
  })
  .finally(() => {
    sendingLock = false
  })
}

module.exports = (s) => {
  skin = s

  skin.db.get()
  .then(k => {
    const { initialize } = DB(k)
    knex = k
    initialize()
  })

  setInterval(scheduleToOutbox, 2 * intervalBase)
  setInterval(sendBroadcasts, 10 * intervalBase)
}

// SCHEDULING (Every 1m) --> Exclusive lock
// TODO Look for outboxed + near or past
// outbox them with good timezone

// SENDING (every 1m) --> Exclusive lock
// TODO Look for past outboxed
// Send them
