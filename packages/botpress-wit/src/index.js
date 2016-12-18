import wit from './wit'

const config = {
  accessToken: 'IOUVNYYZF6J6JT4V4OC5JRUY2NHES7ZC'
}

const incomingMiddleware = (event, next) => {
  if (event.type === 'message') {

    wit.getEntities(event.text)
    .then((entities) => {
      //console.log(entities)
    })



    const context = {
      platform: event.platform,
      user: event.user
    }

    wit.runActions(event.text, event.user.id, context)

    // TODO: Implement call actions
    // wit.callActions(event)
    // .then(() => {
    //   console.log('Action has been called')
    // })
  }
}

module.exports = {
  init: function(bp) {
    bp.middlewares.register({
      name: 'wit.incoming',
      module: 'botpress-wit',
      type: 'incoming',
      handler: incomingMiddleware,
      order: 10,
      description: 'Understand entities from incoming message and suggest or execute actions.'
    })

    wit.setConfiguration(config)
  },

  ready: function(bp) {

    bp.getRouter("botpress-wit")
    .get("/entities", (req, res, next) => {
      // TODO: req message and return entities


    })

    bp.getRouter("botpress-wit")
    .get("/actions", (req, res, next) => {
      // TODO: req message and return entities

    })

  }
}
