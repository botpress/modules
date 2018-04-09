import _ from 'lodash'
import axios from 'axios'

import Provider from './base'

export default class RecastProvider extends Provider {
  constructor(config) {
    super({ ...config, name: 'recast', entityKey: '@recast' })

    this.userSlug = this.config.recastUserSlug
    this.botSlug = this.config.recastBotSlug

    this.client = axios.create({
      baseURL: 'https://api.recast.ai/v2',
      headers: {'Authorization': `Token ${this.config.recastToken}`}
    })
  }

  /*******
  Public API
  *******/

  async init() {
  }

  async sync() {
    throw new Error('Not implemented')
  }

  async checkSyncNeeded() {
    return false // Not implemented yet
  }

  async extract(incomingEvent) {
    const {data: {results}} = await this.client.post('/request', {
      text: incomingEvent.text
    })

    const intentName = _.get(results.intents[0], 'slug') || 'None'
    const confidence = _.get(results.intents[0], 'confidence') || 0
    const entities = []
    _.forEach(results.entities, (value, key) => {
      value.forEach(e => entities.push({...e, entityType: key}))
    })

    return {
      intent: {
        name: intentName,
        confidence: confidence,
        provider: 'recast'
      },
      intents: results.intents.map(intent => ({
        name: intent.slug,
        confidence: intent.confidence,
        provider: 'recast'
      })),
      entities: entities.map(entity => {
        let value = _.omit(entity, ['confidence', 'entityType', 'raw'])
        const valueSize = _.size(value)
        if (valueSize === 1) {
          value = value[Object.keys(value)[0]]
        } else if (valueSize === 0) {
          value = entity.raw
        }

        return {
          name: null,
          type: entity.entityType,
          value,
          original: entity.raw,
          confidence: entity.confidence,
          position: null,
          provider: 'recast'
        }
      }),
      act: results.act, // Recast custom
      type: results.type, // Recast custom
      language: {
        detected: results.language,
        processed: results.processing_language
      },
      sentiment: results.sentiment // Recast custom
    }
  }

  async getCustomEntities() {
    return [] // Not implemented yet
  }
}
