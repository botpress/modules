import deamon from './deamon'
import DB from './db'
import moment from 'moment'

let db = null

module.exports = {
  ingoing: function(event, next) {

  },
  outgoing: function(event, next) {

  },
  init: function(skin) {
    deamon(skin)
    skin.db.get()
    .then(knex => {
      db = DB(knex)
    })
  },
  ready: function(skin) {

    const router = skin.getRouter('skin-broadcast')

    router.get('/broadcasts', (req, res, next) => {
      db.listSchedules()
      .then(rows => {
        const broadcasts = rows.map(row => {
          const [date, time] = row.date_time.split(' ')
          const progress = row.total_count
            ? row.sent_count / row.total_count
            : !!row.outboxed ? 1 : 0
          return {
            type: row.type,
            content: row.text,
            outboxed: !!row.outboxed,
            errored: !!row.errored,
            progress: progress,
            userTimezone: !row.ts,
            date: date,
            time: time,
            id: row.id
          }
        })

        res.send(broadcasts)
      })
    })

    router.post('/broadcasts', (req, res, next) => {
      const { date, time, timezone, content, type } = req.body
      db.addSchedule({ date, time, timezone, content, type })
      .then(id => res.send({ id: id }))
    })

    router.put('/broadcasts', (req, res, next) => {
      const { id, date, time, timezone, content, type } = req.body
      db.updateSchedule({ id, date, time, timezone, content, type })
      .then(() => res.sendStatus(200))
      .catch((err) => {
        res.status(500).send({ message: err.message })
      })
    })

    router.delete('/broadcasts/:id', (req, res, next) => {
      db.deleteSchedule(req.params.id)
      .then(() => {
        res.sendStatus(200)
      })
      .catch((err) => {
        res.status(500).send({ message: err.message })
      })
    })
  }
}
