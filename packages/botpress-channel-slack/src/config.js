import _ from 'lodash'
import createStorage from './storage'

/**
 * Example:
 *
 * import createConfig from './config'
 *
 * const config = createConfig(bp)
 * const token = config.slackApiToken.get()
 *
 * // set token
 * config.slackApiToken.set(NEW_TOKEN)
 */
export default bp => {
  const configKeys = [
    'slackApiToken'
  ]

  const configDefaults = {
    slackApiToken: process.env.BOTPRESS_SLACK_TOKEN
  }

  const configStorage = createStorage(bp, configDefaults)

  // inner config memory
  const config = configStorage.load()

  const createConfigAccessMethods = (key) => ({
    get: () => {
      if (!_.has(config, key)) {
        throw new Error(`config variable not set: ${key}`)
      }

      return config[key]
    },
    set: value => {
      config[key] = value
      configStorage.save(config)
    }
  })

  return _.reduce((acc, key) => ({
    ...acc,
    [key]: createConfigAccessMethods(key)
  }), {}, configKeys)
}
