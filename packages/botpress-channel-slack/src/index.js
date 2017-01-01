import setupApi from './api'
import createSendFuncs from './sendFuncs'
import createConfig from './config'
import SlackConnector from './slackConnector'
import Middlewares from './middlewares'

let slackConn

const channelName = 'slack-module-test'
let channel = null
const getChannel = () => channel

module.exports = {
  init(bp) {
    const config = createConfig(bp)

    bp.slack = createSendFuncs(bp.middlewares.sendOutgoing)

    const slackApiToken = config.slackApiToken.get()
    // TODO check token
    slackConn = SlackConnector(slackApiToken, bp.middlewares.sendIncoming)

    // TODO channel list api
    // TODO select channel api
    slackConn.authenticateP.done(data => {
      channel = data.channels.filter(c => c.name === channelName)[0]
    })

    Middlewares(slackConn, getChannel).forEach(bp.middlewares.register)
  },

  ready(bp) {
    const router = bp.getRouter('botpress-slack')
    setupApi(bp, getChannel, router)
    slackConn.connect()
  }
}
