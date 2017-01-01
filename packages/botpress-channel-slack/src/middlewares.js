export default (slackConn, getChannel) => {

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

  return [
    // TODO this is only for test and will remove later
    {
      name: 'slack.testIncomingMiddleware',
      type: 'incoming',
      order: 100,
      handler: incomingMiddleware,
      module: 'botpress-slack',
      description: 'test incoming middleware for slack connector'
    },

    {
      name: 'slack.sendMessages',
      type: 'outgoing',
      order: 100,
      handler: outgoingMiddleware,
      module: 'botpress-slack',
      description: 'Sends out messages that targets platform = slack.' +
      ' This middleware should be placed at the end as it swallows events once sent.'
    }
  ]
}
