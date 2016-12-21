// TODO handle channel == null
export default (bp, getChannel, router) => {
  router.post('/sendMessage', (req, res) => {
    const event =  {
      type: 'text',
      platform: 'slack',
      text: req.body.message,
      raw: {
        channelId: getChannel().id
      }
    }

    bp.middlewares.sendOutgoing(event)
    res.status(200).end()
  })
}
