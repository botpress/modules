import db from './db'

module.exports = {
  init: function(bp) {
    db(bp).bootstrap()
  },
  ready: function(bp) {

    const router = bp.getRouter('botpress-scheduler')

    router.get('/schedules/upcoming', (req, res) => {
      db(bp).listUpcoming()
      .then(schedules => res.send(schedules))
    })

    router.get('/schedules/past', (req, res) => {
      db(bp).listPrevious()
      .then(schedules => res.send(schedules))
    })

    router.put('/schedules/:id', (req, res) => {
      db(bp).create(req.params.id, req.body)
      .then(schedules => res.send(schedules))
    })

    router.post('/schedules/:id', (req, res) => {
      db(bp).update(req.params.id, req.body)
      .then(() => res.sendStatus(200))
    })

    router.delete('/schedules/:id', (req, res) => {
      db(bp).delete(req.params.id)
      .then(() => res.sendStatus(200))
    })

  }
}
