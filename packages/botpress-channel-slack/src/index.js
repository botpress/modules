import setupApi from './api'
import createSendFuncs from './sendFuncs'
import createConfig from './config'
import SlackConnector from './slackConnector'

let slackConn

const channelName = 'slack-module-test'
let channel = null
const getChannel = () => channel

const incomingMiddleware = (event, next) => {
  const {
    platform,
    type,
    text,
    raw: { channel }
  } = event

  if (platform !== 'slack' || type !== 'message') return next()
  event.bp.slack.sendText(`${text} from channel ${channel}`, getChannel().id)
}

const outgoingMiddleware = (event, next) => {
  if (event.platform !== 'slack') {
    return next()
  }

  // if (!outgoing[event.type]) {
  //   return next('Unsupported event type: ' + event.type)
  // }
  //
  // outgoing[event.type](event, next, messenger)

  const {text, raw: {channelId}} = event
  slackConn.rtm.sendMessage(text, channelId)
}

module.exports = {
  init(bp) {
    const config = createConfig(bp)

    bp.slack = createSendFuncs(bp.middlewares.sendOutgoing)

    // TODO this is only for test and will remove later
    bp.middlewares.register({
      name: 'slack.testIncomingMiddleware',
      type: 'incoming',
      order: 100,
      handler: incomingMiddleware,
      module: 'botpress-slack',
      description: 'test incoming middleware for slack connector'
    })

    // TODO refactor this
    bp.middlewares.register({
      name: 'slack.sendMessages',
      type: 'outgoing',
      order: 100,
      handler: outgoingMiddleware,
      module: 'botpress-slack',
      description: 'Sends out messages that targets platform = slack.' +
      ' This middleware should be placed at the end as it swallows events once sent.'
    })

    const slackApiToken = config.slackApiToken.get()
    // TODO check token
    slackConn = SlackConnector(slackApiToken, bp.middlewares.sendIncoming)

    // TODO channel list api
    // TODO select channel api
    slackConn.authenticateP.done(data => {
      channel = data.channels.filter(c => c.name === channelName)[0]
    })
  },

  ready(bp) {
    const router = bp.getRouter('botpress-slack')
    setupApi(bp, getChannel, router)

    slackConn.connect()
  }
}
