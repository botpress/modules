// TODO handle channel == null
export default (rtm, getChannel, router) => {
  router.post('/sendMessage', (req, res) => {
    rtm.sendMessage(req.body.message, getChannel().id)
    res.status(200).end()
  })
}
