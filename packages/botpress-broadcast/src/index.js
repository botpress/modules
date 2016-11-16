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
        let broadcasts = {}

        for (let row of rows) {
          let date = row.date_time
          let time = row.date_time
          let userTimezone = !!row.ts ? false : true
          let progress = 0

          if (row.total_count != 0) {
            progress = row.sent_count / row.total_count
          }
          let outboxed =  !!row.outboxed ? true : false

          broadcasts[row.id] = {
            type: row.type,
            content: row.text,
            outboxed: outboxed,
            progress: progress,
            userTimezone: userTimezone,
            date: date,
            time: time
          }
        }
        console.log(broadcasts)
        res.send({broadcasts})
      })
    })

    router.post('/broadcasts', (req, res, next) => {
      const { timestamp, userTimezone, content, type } = req.body
      db.addSchedule({
        dateTime: timestamp,
        userTimezone: userTimezone,
        content: content,
        type: type
      })
      .then(id => {
        res.send({ id: id })
      })
    })

    router.put('/broadcasts', (req, res, next) => {
      const { id, timestamp, userTimezone, content, type } = req.body
      db.updateSchedule({
        id: id,
        dateTime: timestamp,
        userTimezone: userTimezone,
        content: content,
        type: type
      })
      .then(() => {
        res.sendStatus(200)
      })
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
