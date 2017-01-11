/**
 * slack connector <-> adapter <-> middlware (sendIncoming, outgoingMiddleware)
 */
export default ({register, sendIncoming}) => {

  // slack connector, check ./slackConnector.js for detail
  let slackConn = null

  const outgoingMiddleware = (event, next) => {
    if (event.platform !== 'slack') {
      return next()
    }

    // if (!outgoing[event.type]) {
    //   return next('Unsupported event type: ' + event.type)
    // }
    //
    // outgoing[event.type](event, next, messenger)

    // TODO update slackConn connection state
    if (!slackConn) return

    const {text, raw: {channelId}} = event
    slackConn.rtm.sendMessage(text, channelId)
  }

  register({
    name: 'slack.sendMessages',
    type: 'outgoing',
    order: 100,
    handler: outgoingMiddleware,
    module: 'botpress-slack',
    description: 'Sends out messages that targets platform = slack.' +
    ' This middleware should be placed at the end as it swallows events once sent.'
  })

  return {
    setSlackConn: conn => slackConn = conn,
    sendIncoming,
  }
}
