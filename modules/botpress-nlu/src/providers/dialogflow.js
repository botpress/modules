import _ from 'lodash'
import crypto from 'crypto'
import dialogflow from 'dialogflow'

import Provider from './base'

export default class DialogflowProvider extends Provider {
  constructor(config) {
    super({ ...config, name: 'dialogflow', entityKey: '@dialogflow' })

    this.projectId = this.config.googleProjectId

    this.agentClient = new dialogflow.AgentsClient()
    this.sessionClient = new dialogflow.SessionsClient()
  }

  _getSessionId(event) {
    let shortUserId = _.get(event, 'user.id') || ''
    if (shortUserId.length > 36) {
      shortUserId = crypto.createHash('md5').update(shortUserId).digest('hex')
    }
    return shortUserId
  }

  /*******
  Public API
  *******/

  async init() {
    const [agent] = await this.agentClient.getAgent({parent: this.agentClient.projectPath(this.projectId)})
    this.agent = agent
  }

  async sync() {
    throw new Error('Not implemented')
  }

  async checkSyncNeeded() {
    return false // Not implemented yet
  }

  async extract(event) {
    const request = {
      session: this.sessionClient.sessionPath(this.projectId, this._getSessionId(event)),
      queryInput: {
        text: {
          text: event.text,
          languageCode: this.agent.defaultLanguageCode
        },
      },
    }
    const detection = await this.sessionClient.detectIntent(request)
    const {queryResult} = detection[0]
    const entities = _.map(queryResult.parameters.fields, (v, k) => ({name: k, value: v.stringValue}))

    return {
      intent: {
        name: queryResult.intent.displayName,
        confidence: queryResult.intentDetectionConfidence,
        provider: 'dialogflow'
      },
      entities: entities.map(entity => ({
        name: entity.name, // usually the entity name, but can be modified
        type: entity.name, // when parameter name modified dialogflow doesn't give the original entity name
        value: entity.value,
        original: null,
        confidence: null,
        position: null,
        provider: 'dialogflow'
      }))
    }
  }

  async getCustomEntities() {
    return [] // Not implemented yet
  }
}
