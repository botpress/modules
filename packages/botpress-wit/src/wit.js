import Wit from 'node-wit'
import moment from 'moment'

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
  latestConfig = config
  initializeClient(bp, config)
}

const reinitializeClient = bp => () => {
  initializeClient(bp, latestConfig)
}

const initializeClient = (bp, config) => {
  client = new Wit({
    accessToken: config.accessToken,
    actions: bp.wit.actions,
    logger: bp.logger
  })
}

const getEntities = (userId, message) => {
  const { context } = getUserContext(userId)
  return client.message(message, context)
  .then(({ entities }) => entities)
}

const runActions = (userId, message) => {
  const { context, sessionId } = getUserContext(userId)
  client.runActions(sessionId, message, context)
  .then(newContext => {
    getUserContext(userId).context = newContext
  })
}

const defaultSendAction = (request, response) => {

}

module.exports = bp => {

  bp.wit = {
    actions: {},
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
