export default (router, {
  sendText,
  getStatus
}) => {
  router.post('/sendMessage', (req, res) => {
    sendText(req.body.message)
    res.status(200).end()
  })

  router.get('/status', (req, res) => {
    res.json(getStatus())
  })
}
