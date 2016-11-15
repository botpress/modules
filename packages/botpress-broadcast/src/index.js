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
      // TODO Return all broadcasts
    })

    router.post('/broadcasts', (req, res, next) => {
      const { date, userTimeZone, content, type } = req.body
      console.log(req.body)
      db.addSchedule({ 
        dateTime: date,
        userTimezone: userTimeZone,
        content: content,
        type: type
      })
      .then(id => {
        res.send({ id: id })
      })
    })

  }
}
