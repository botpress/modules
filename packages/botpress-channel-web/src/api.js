import _ from 'lodash'
import path from 'path'

import injectScript from 'raw!./inject.js'
import injectStyle from 'raw!./inject.css'
import notificationSound from 'raw!../static/notification.mp3'

import serveStatic from 'serve-static'

import db from './db'
import users from './users'

const ERR_USER_ID_REQ = "`userId` is required and must be valid"
const ERR_MSG_TYPE = "`type` is required and must be valid"

/*
  Supported message types:

  *** type: text ***
      text: "string", up to 360 chars
      raw: null
      data: null

  *** type: file ***
      text: "text associated with the file", up to 360 chars
      raw: {
        file_name: "lol.png"
        file_mime: "image/png"
      }
      data: BINARY_DATA // max size = 10 Mb

 */

module.exports = async (bp, config) => {

  const knex = await bp.db.get()

  const { listConversations, 
    getConversation, 
    appendUserMessage, 
    getOrCreateRecentConversation } = db(knex, bp.botfile)

  const { getOrCreateUser } = await users(bp, config)

  const router = bp.getRouter('botpress-platform-webchat', { auth: false })
  
  const asyncApi = fn => async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (err) {
      res.status(500).send(err && err.message)
    }
  }

  router.get('/inject.js', (req, res) => {
    res.contentType('text/javascript')
    res.send(injectScript)
  })

  router.get('/inject.css', (req, res) => {
    res.contentType('text/css')
    res.send(injectStyle)
  })

  const modulePath = bp._loadedModules['botpress-platform-webchat'].root
  const staticFolder = path.join(modulePath, './static')
  router.use('/static', serveStatic(staticFolder))

  // ?conversationId=xxx (optional)
  router.post('/messages/:userId', asyncApi(async (req, res) => {
    const { userId } = req.params || {}

    if (!validateUserId(userId)) {
      return res.status(400).send(ERR_USER_ID_REQ)
    }

    await getOrCreateUser(userId) // Just to create the user if it doesn't exist

    const payload = (req.body || {})
    let { conversationId } = (req.query || {})
    conversationId = conversationId && parseInt(conversationId)

    if (!_.includes(['text', 'quick_reply', 'login_prompt'], payload.type)) { // TODO: Support files
      return res.status(400).send(ERR_MSG_TYPE)
    }

    if (!conversationId) {
      conversationId = await getOrCreateRecentConversation(userId)
    }

    await sendNewMessage(userId, conversationId, payload)

    return res.sendStatus(200)
  }))

  router.get('/conversations/:userId/:conversationId', async (req, res) => {
    const { userId, conversationId } = req.params || {}

    if (!validateUserId(userId)) {
      return res.status(400).send(ERR_USER_ID_REQ)
    }

    const conversation = await getConversation(userId, conversationId)

    return res.send(conversation)
  })
  
  router.get('/conversations/:userId', async (req, res) => {
    const { userId } = req.params || {}

    if (!validateUserId(userId)) {
      return res.status(400).send(ERR_USER_ID_REQ)
    }

    await getOrCreateUser(userId) // Just to create the user if it doesn't exist

    const conversations = await listConversations(userId)

    return res.send([...conversations])
  })

  function validateUserId(userId) {
    return /[a-z0-9-_]+/i.test(userId)
  }

  async function sendNewMessage(userId, conversationId, payload) {

    if (!payload.text || !_.isString(payload.text) || payload.text.length > 360) {
      throw new Error('Text must be a valid string of less than 360 chars')
    }

    const sanitizedPayload = _.pick(payload, ['text', 'type', 'data'])

    // Because we don't necessarily persist what we emit/received
    const persistedPayload = Object.assign({}, sanitizedPayload)

    // We remove the password from the persisted messages for security reasons
    if (payload.type === 'login_prompt') {
      persistedPayload.data = _.omit(persistedPayload.data, ['password'])
    }

    const message = await appendUserMessage(userId, conversationId, persistedPayload)

    Object.assign(message, {
      __room: 'visitor:' + userId // This is used to send to the relevant user's socket
    })

    bp.events.emit('guest.webchat.message', message)

    const user = await getOrCreateUser(userId)

    return bp.middlewares.sendIncoming(Object.assign({
      platform: 'webchat',
      type: payload.type,
      user: user,
      text: payload.text,
      raw: Object.assign({}, sanitizedPayload, {
        conversationId
      })
    }, payload.data))
  }

  async function sendEvent(userId, event, data) {

  }

  return router
}
