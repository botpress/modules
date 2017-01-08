export default (router, {
  sendText,
  getStatus,
  getConfigs,
  setConfigs,
}) => {
  router.post('/sendMessage', (req, res) => {
    sendText(req.body.message)
    res.status(200).end()
  })

  router.get('/status', (req, res) => {
    res.json(getStatus())
  })

  router.get('/configs', (req, res) => {
    res.json(getConfigs())
  })

  router.post('/configs', (req, res) => {
    setConfigs(req.body)
    res.json(getConfigs())
  })
}
