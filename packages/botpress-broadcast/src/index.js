module.exports = {
  ingoing: function(event, next) {

  },
  outgoing: function(event, next) {

  },
  init: function(skin) {

  },
  ready: function(skin) {

    const router = skin.getRouter('skin-broadcast')

    router.get('/broadcasts', (req, res, next) => {
      // TODO Return all broadcasts
    })

    router.post('/broadcasts', (req, res, next) => {
      const { date, time, userTimezone, text, textType } = req.body
      
      // TODO Create broadcast
    })

  }
}
