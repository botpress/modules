import setupApi from './api'
import createSendFuncs from './sendFuncs'
import createConfig from './config'
import createAdapter from './adapter'

// TODO refactor rename it for better naming consistency
import SlackConnector from './slackConnector'

// TODO remove this
import { createTestIncomingMiddleware } from './testHelper'

let adapter = null
let slackConn = null

const channelName = 'slack-module-test'
let channel = null
const getChannel = () => channel

// TODO
// 2. aggregate SlackConnector creation
// 3. configurable slack api token
//    - status management
//      - no token
//      - connection failed
//    - update config api -> restart slack rtm if token changed

module.exports = {
  init(bp) {
    bp.slack = createSendFuncs(bp.middlewares.sendOutgoing)
    adapter = createAdapter(bp.middlewares)

    // TODO this is test only
    bp.middlewares.register(
      createTestIncomingMiddleware(getChannel)
    )
  },

  ready(bp) {
    const router = bp.getRouter('botpress-slack')

    // TODO handle channel == null
    const sendText = message => {
      bp.slack.sendText(message, getChannel().id)
    }

    const getStatus = () => ({
      hasSlackApiToken: false,
      isSlackConnected: false
    })

    setupApi(router, {
      sendText,
      getStatus
    })

    const config = createConfig(bp)
    const slackApiToken = config.slackApiToken.get()
    // TODO check token
    slackConn = SlackConnector(slackApiToken, adapter.sendIncoming)

    // TODO channel list api
    // TODO select channel api
    slackConn.authenticateP.done(data => {
      channel = data.channels.filter(c => c.name === channelName)[0]
      adapter.setSlackConn(slackConn)
    })

    slackConn.connect()
  }
}
