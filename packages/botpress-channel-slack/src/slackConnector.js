import Promise from 'bluebird'
import { RtmClient, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client'

// TODO handle all events from slack
//
// - connection failed
//
export default (slackApiToken, sendIncoming) => {
  let data
  let isConnected = false

  const rtm = new RtmClient(slackApiToken)

  const authenticateP = new Promise((resolve) => {
    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
      data = rtmStartData
      resolve(data)
    })
  })

  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    isConnected = true
  })

  /**
   * messge example
   *
   * { type: 'message',
   *   channel: 'C3G5ALKR9',
   *   user: 'U0LFNE5J9',
   *   text: 'test',
   *   ts: '1482827691.000008',
   *   team: 'T0F3U2VU3' }
   */
  rtm.on(RTM_EVENTS.MESSAGE, (message) => {
    sendIncoming({
      platform: 'slack',
      type: 'message',
      text: message.text,
      raw: message
    })
  })

  return {
    authenticateP,
    rtm,
    isConnected: () => isConnected,
    getData: () => data,
    connect: () => rtm.start()
  }
}
