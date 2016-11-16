import deamon from './deamon'
import DB from './db'

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
      .then(broadcasts => {
        // res.send({broadcasts: broadcasts})
        res.send({broadcasts: {}})
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
