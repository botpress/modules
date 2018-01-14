import axios from 'axios'
import _ from 'lodash'

import Provider from './base'
import Entities from './entities'

const LUIS_APP_VERSION = '1.1' // Fixed, we're not using this as everything is source-controlled in your bot

// TODO Remake the UI for intents input & labelling
  // TODO Make it easy to see if you have duplicates as well
// TODO Check if in Sync + Sync if needed
// TODO Add new Provider Entities (Guide, API Hooks)
// TODO UI Sync Status + Sync Button
// TODO Continuous learning backend
// TODO Continuous learning frontend

export default class LuisProvider extends Provider {
  constructor(config, logger, storage, parser) {
    super('luis', logger, storage, parser)

    this.appId = config.luisAppId
    this.programmaticKey = config.luisProgrammaticKey
    this.appSecret = config.luisAppSecret
    this.appRegion = config.luisAppRegion
  }

  async deleteVersion() {
    try {
      const del = await axios.delete(
        `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${this.appId}/versions/${LUIS_APP_VERSION}/`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.programmaticKey
          }
        }
      )

      if (del.statusCode === 200) {
        this.logger.debug('[NLU::Luis] Removed old version of the model')
      }
    } catch (err) {
      this.logger.debug('[NLU::Luis] Could not remove old version of the model')
    }
  }

  async getAppInfo() {
    try {
      const response = await axios.get(`https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${this.appId}`, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.programmaticKey
        }
      })
      return response.data
    } catch (err) {
      console.log(require('util').inspect(err))
      throw new Error('[NLU::Luis] Could not find app ' + this.appId)
    }
  }

  async sync() {
    await this.deleteVersion() // TODO Check if there was an old version before deleting it
    let intents = await this.storage.getIntents()

    const utterances = []
    const builtinEntities = []

    intents = intents.map(i => Object.assign({}, i, { utterances: this.parser.parse(i.content) }))

    intents.forEach(intent => {
      intent.utterances.forEach(u => {
        let text = ''
        let position = 0
        const entities = []

        u.forEach(token => {
          if (_.isString(token)) {
            position += token.length
            text += token
          } else {
            text += token.text

            const entity = Entities[token.entity]

            if (!entity || !token.entity.startsWith('@native.')) {
              throw new Error(
                '[NLU::Luis] Unknown entity: ' + token.entity + '. Botpress NLU only supports native entities for now.'
              )
            }

            if (!entity['@luis']) {
              throw new Error("[NLU::Luis] LUIS doesn't support entity of type " + token.entity)
            }

            if (builtinEntities.indexOf(entity['@luis']) === -1) {
              builtinEntities.push(entity['@luis'])
            }

            entities.push({
              entity: entity['@luis'],
              startPos: position,
              endPos: position + token.text.length
            })
            position += token.text.length
          }
        })

        utterances.push({
          text: text,
          intent: intent.name,
          entities: entities
        })
      })
    })

    const appInfo = await this.getAppInfo()

    const body = {
      luis_schema_version: '2.1.0',
      versionId: LUIS_APP_VERSION,
      name: appInfo.name,
      desc: appInfo.description,
      culture: appInfo.culture,
      intents: intents.map(i => ({ name: i.name })),
      entities: [],
      composites: [],
      closedLists: [],
      bing_entities: builtinEntities,
      model_features: [],
      regex_features: [],
      utterances: utterances
    }

    try {
      const result = await axios.post(
        `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${this
          .appId}/versions/import?versionId=${LUIS_APP_VERSION}`,
        body,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.programmaticKey
          }
        }
      )
      this.logger.info('[NLU::Luis] Synced model [' + result.data + ']')
    } catch (err) {
      this.logger.error('[NLU::Luis] Could not sync the model. Error = ' + err && err.message)
    }
  }

  async publish() {
    return new Promise((resolve, reject) => {
      this.resolvePublish = resolve
      this.rejectPublish = reject
    })
  }

  async extractEntities(incomingText) {}

  async classifyIntent(incomingText) {}
}
