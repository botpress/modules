import { RtmClient, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client'
import setupApi from './api'

const token = process.env.PROTORISK_SLACK_TOKEN
if (!token) throw new Error('env variable not set: PROTORISK_SLACK_TOKEN')

const rtm = new RtmClient(token)

const channelName = 'slack-module-test'
let channel = null
const getChannel = () => channel

/* following is reference code from botpress-messenger */
/* TODO remove this */
// let messenger = null
//
//
// module.exports = {
//   init: function(bp) {
//
//     ...
//
//     bp.messenger = {}
//     _.forIn(actions, (action, name) => {
//       var sendName = name.replace(/^create/, 'send')
//       bp.messenger[sendName] = function() {
//         var msg = action.apply(this, arguments)
//         bp.middlewares.sendOutgoing(msg)
//       }
//     })

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
  rtm.sendMessage(text, channelId)
}

module.exports = {
  init(bp) {
    bp.logger.debug('log in botpress slack')

    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
      channel = rtmStartData.channels.filter(c => c.name === channelName)[0]
      console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`)
      console.log(channel)
    })

    // you need to wait for the client to fully connect before you can send messages
    rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
      console.log('connection opened')
      rtm.sendMessage('this is a test message from slack bot api: Hello!', channel.id)
    })

    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
      rtm.sendMessage(`${message.text} from channel ${message.channel}`, channel.id)
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
  },

  ready(bp) {
    const router = bp.getRouter('botpress-slack')
    setupApi(bp, getChannel, router)

    rtm.start()
  }
}
