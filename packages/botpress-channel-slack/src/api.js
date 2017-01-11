export default (router, {
  sendText,
  getStatus,
  getConfig,
  setConfig,
}) => {
  router.post('/sendMessage', (req, res) => {
    sendText(req.body.message)
    res.status(200).end()
  })

  router.get('/status', (req, res) => {
    res.json(getStatus())
  })

  router.get('/config', (req, res) => {
    res.json(getConfig())
  })

  router.post('/config', (req, res) => {
    setConfig(req.body)
    res.json(getConfig())
  })
}
