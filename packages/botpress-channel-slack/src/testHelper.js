export const createTestIncomingMiddleware = getChannel => {
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

  return {
    name: 'slack.testIncomingMiddleware',
    type: 'incoming',
    order: 100,
    handler: incomingMiddleware,
    module: 'botpress-slack',
    description: 'test incoming middleware for slack connector'
  }
}
