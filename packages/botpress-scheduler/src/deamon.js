import Promise from 'bluebird'

import db from './db'
import util from './util'

let timerInterval = null

module.exports = (bp) => {

  const reschedule = task => {
    if (task.schedule_type.toLowerCase() === 'once') {
      return Promise.resolve(null)
    }
    
    const nextOccurence = util.getNextOccurence(task.schedule_type, task.schedule)

    return db(bp).scheduleNext(task.id, nextOccurence.format('x'))
  }

  const run = () => {
    db(bp).listExpired()
    .then(list => {
      return Promise.map(list, expired => {
        let fromDate = null
        return reschedule(expired)
        .then(() => {
          db(bp).updateTask(expired.id, expired.scheduledOn, 'executing', null, null)
        })
        .then(() => {
          if (expired.enabled) {
            fromDate = new Date()
            var fn = new Function('bp', 'task', expired.action)
            bp.events.emit('scheduler.update')
            bp.events.emit('scheduler.started', expired)
            return fn(bp, expired)
          } else {
            bp.logger.debug('[scheduler] Skipped task ' + expired.id + '. Reason=disabled')
          }
        })
        .then(result => {
          const returned = (result && result.toString && result.toString()) || result
          const logsQuery = {
            from: fromDate,
            until: new Date(),
            limit: 1000,
            start: 0,
            order: 'desc',
            fields: ['message']
          }
          let logsQueryPromise = Promise.resolve(null)
          if (expired.enabled) {
            logsQueryPromise = Promise.fromCallback(callback => bp.logger.query(logsQuery, callback))
          }

          return logsQueryPromise
          .then(logs => {
            if (expired.enabled) {
              return db(bp).updateTask(expired.id, expired.scheduledOn, 'done', logs, returned)
            } else {
              return db(bp).updateTask(expired.id, expired.scheduledOn, 'skipped', null, null)
            }
          })
          .then(() => {
            bp.events.emit('scheduler.update')
            bp.events.emit('scheduler.finished', expired)
          })
        })
        .catch(err => {
          bp.logger.error('[scheduler]', err.message, err.stack)
          bp.notifications.send({
            message: 'An error occured while running task: ' + expired.id + '. Please check the logs for more info.',
            level: 'error'
          })
          return db(bp).updateTask(expired.id, expired.scheduledOn, 'error', null, null)
        })
      })
    })
  }

  const revive = () => db(bp).reviveAllExecuting()
  const start = () => timerInterval = setInterval(run, 30000)
  const stop = () => clearInterval(timerInterval)

  return { start, stop, revive }
}
