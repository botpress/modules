import createConfig from './config'
import outgoing from './outgoing'
import actions from './actions'

import _ from 'lodash'
import axios from 'axios'
import Promise from 'bluebird'

import Slack from './slack'

let adapter = null
let connection = null
let channels = null
let slack = null
const outgoingPending = outgoing.pending

const outgoingMiddleware = (event, next) => {
  if (event.platform !== 'slack') {
    return next()
  }

  if (!outgoing[event.type]) {
    return next('Unsupported event type: ' + event.type)
  }

  const setValue = method => (...args) => {
    if (event.__id && outgoingPending[event.__id]) {
      outgoingPending[event.__id][method].apply(null, args)
      delete outgoingPending[event.__id]
    }
  }

  outgoing[event.type](event, next, slack)
  .then(setValue('resolve'), setValue('reject'))
}

module.exports = {
  init(bp) {
    bp.middlewares.register({
      name: 'slack.sendMessages',
      type: 'outgoing',
      order: 100,
      handler: outgoingMiddleware,
      module: 'botpress-slack',
      description: 'Sends out messages that targets platform = slack.' +
      ' This middleware should be placed at the end as it swallows events once sent.'
    })

    bp.slack = {}
    _.forIn(actions, (action, name) => {
      bp.slack[name] = actions[name]
      let sendName = name.replace(/^create/, 'send')
      bp.slack[sendName] = Promise.method(function() {

        var msg = action.apply(this, arguments)
        msg.__id = new Date().toISOString() + Math.random()
        const resolver = { event: msg }

        const promise = new Promise(function(resolve, reject) {
          resolver.resolve = resolve
          resolver.reject = reject
        })

        outgoingPending[msg.__id] = resolver

        bp.middlewares.sendOutgoing(msg)

        return promise
      })
    })
  },

  ready(bp) {
    const config = createConfig(bp)

    slack = new Slack(bp, config)

    const router = bp.getRouter('botpress-slack', { 'auth': req => !/\/action-endpoint/i.test(req.originalUrl) })

    const sendText = (message, channelId) => {
      slack.sendText(message, channelId)
    }

    const getStatus = () => ({
      hasApiToken: !!config.apiToken.get(),
      isSlackConnected: slack.isConnected()
    })

    const setConfigAndRestart = newConfigs => {
      config.setAll(newConfigs)
      slack.connect(bp)
    }

    slack.connect(bp)

    router.post('/sendMessage', (req, res) => {
      sendText(req.body.message)
      res.status(200).end()
    })

    router.get('/status', (req, res) => {
      res.json(getStatus())
    })

    router.get('/config', (req, res) => {
      res.json(config.getAll())
    })

    router.post('/config', (req, res) => {
      setConfigAndRestart(req.body)
      res.json(config.getAll())
    })
  }
}
