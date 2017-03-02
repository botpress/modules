import moment from 'moment'

const {Wit} = require('node-wit')

let latestConfig = null
let client = null

const contexts = {}

const resetContext = userId => {
  contexts[userId] = {
    begin: moment(),
    sessionId: userId + '-' + Math.random().toString().substr(2, 5),
    context: {}
  }
}

const contextExpired = userId => {
  return moment().diff(contexts[userId].begin, 'hours') > 5
}

const getUserContext = userId => {
  if (!contexts[userId] || contextExpired(userId)) {
    resetContext(userId)
  }

  return contexts[userId]
}

const setConfiguration = bp => config => {
  bp.wit.mode = config.selectedMode
  latestConfig = config

  if (bp.wit.mode === 'stories' && !bp.wit.actions.send) {
    bp.logger.debug('[Wit.ai] In <stories> mode, Wit must be initialized manually')
    return
  }

  initializeClient(bp, config)
}

const reinitializeClient = bp => () => {
  if (latestConfig) {
    initializeClient(bp, latestConfig)
  }
}

const initializeClient = (bp, config) => {
  let witConfig = {
    accessToken: config.accessToken,
    logger: bp.logger,
    apiVersion: '20160526'
  }

  if (config.selectedMode === 'stories') {
    witConfig.actions = bp.wit.actions
  }

  client = new Wit(witConfig)
}

const getEntities = (userId, message) => {
  const { context } = getUserContext(userId)
  return client.message(message, context)
  .then(({ entities }) => entities)
}

const runActions = (userId, message) => {
  const { context, sessionId } = getUserContext(userId)
  return client.runActions(sessionId, message, context)
  .then(newContext => {
    getUserContext(userId).context = newContext
  })
}

const defaultSendAction = bp => ({sessionId, context}, {text, quickreplies}) => {
  return new Promise((resolve, reject) => {
    const userId = sessionId.split('-')[0]
    if (context.botpress_platform === 'facebook') {
      return bp.messenger.sendText(userId, text, { quick_replies: quickreplies })
      .then(() => resolve())
      .catch(reject)
    } 
    // default platform
    bp.middlewares.sendOutgoing({
      type: 'text',
      platform: context.botpress_platform,
      text: text,
      raw: {
        to: userId,
        message: text
      }
    })
  })
}

module.exports = bp => {

  bp.wit = {
    mode: null,
    actions: { send: defaultSendAction(bp) },
    reinitializeClient: reinitializeClient(bp)
  }

  return {
    reinitializeClient: reinitializeClient(bp),
    setConfiguration: setConfiguration(bp),
    getEntities: getEntities,
    runActions: runActions,
    getUserContext: getUserContext
  }
}
