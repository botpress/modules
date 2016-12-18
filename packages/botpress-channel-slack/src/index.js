import { RtmClient, CLIENT_EVENTS } from '@slack/client'

const token = process.env.PROTORISK_SLACK_TOKEN
if (!token) throw new Error('env variable not set: PROTORISK_SLACK_TOKEN')

const rtm = new RtmClient(token)

const channelName = 'slack-module-test'
let channel = null

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
  },

  ready() {
    rtm.start()
  }
}
