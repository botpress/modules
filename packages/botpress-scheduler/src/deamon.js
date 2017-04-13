import Promise from 'bluebird'

import db from './db'
import util from './util'
import moment from 'moment'
let timerInterval = null
let lock = false

module.exports = (bp) => {

  const reschedule = task => {
    if (task.schedule_type.toLowerCase() === 'once') {
      return Promise.resolve(null)
    }

    const nextOccurence = util.getNextOccurence(task.schedule_type, task.schedule).toDate()

    return db(bp).scheduleNext(task.id, nextOccurence)
  }

  const run = () => {
    if (lock === true) {
      return
    }

    lock = true
    Promise.resolve(db(bp).listExpired())
    .then(list => {
      return Promise.map(list, expired => {
        let fromDate = null
        return reschedule(expired)
        .then(() => {
          db(bp).updateTask(expired.taskId, 'executing', null, null)
        })
        .then(() => {
          if (expired.enabled) {
            fromDate = new Date()
            var fn = new Function('bp', 'task', expired.action)
            bp.events.emit('scheduler.update')
            bp.events.emit('scheduler.started', expired)
            return fn(bp, expired)
          } else {
            bp.logger.debug('[scheduler] Skipped task ' + expired.taskId + '. Reason=disabled')
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
            const flattenLogs = (logs && logs.file && logs.file.map(x => x.message) || []).join('\n')
            if (expired.enabled) {
              return db(bp).updateTask(expired.taskId, 'done', flattenLogs, returned)
            } else {
              return db(bp).updateTask(expired.taskId, 'skipped', null, null)
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
            message: 'An error occured while running task: ' + expired.taskId + '. Please check the logs for more info.',
            level: 'error'
          })
          return db(bp).updateTask(expired.taskId, 'error', null, null)
        })
      })
    })
    .finally(() => {
      lock = false
    })
  }

  const revive = () => db(bp).reviveAllExecuting()
  const start = () => {
    clearInterval(timerInterval)
    timerInterval = setInterval(run, 5000)
  }
  const stop = () => clearInterval(timerInterval)

  return { start, stop, revive }
}
