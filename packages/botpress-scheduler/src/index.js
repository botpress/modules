import db from './db'
import deamon from './deamon'

module.exports = {
  init: function(bp) {
    db(bp).bootstrap()
    .then(() => {
      const d = deamon(bp)
      return d.revive()
      .then(() => d.start())
    })
  },
  ready: function(bp) {

    const router = bp.getRouter('botpress-scheduler')

    const catchError = res => err => {
      const message = typeof(err) === 'string' ? err : err.message
      res.status(500).send({ message })
    }

    router.get('/schedules/upcoming', (req, res) => {
      db(bp).listUpcoming()
      .then(schedules => res.send(schedules))
      .catch(catchError(res))
    })

    router.get('/schedules/past', (req, res) => {
      db(bp).listPrevious()
      .then(schedules => res.send(schedules))
      .catch(catchError(res))
    })

    router.put('/schedules', (req, res) => {
      db(bp).create(req.body.id, req.body)
      .then(schedules => res.send(schedules))
      .catch(catchError(res))
    })

    router.post('/schedules', (req, res) => {
      db(bp).update(req.body.id, req.body)
      .then(() => res.sendStatus(200))
      .catch(catchError(res))
    })

    router.delete('/schedules', (req, res) => {
      db(bp).delete(req.body.id)
      .then(() => res.sendStatus(200))
      .catch(catchError(res))
    })

  }
}
