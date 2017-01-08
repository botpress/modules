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

  const createConfigAccessMethods = key => ({
    get: () => config[key],
    set: value => {
      config[key] = value
      configStorage.save(config)
    }
  })

  const accessMethods = _.reduce(configKeys, (acc, key) => ({
    ...acc,
    [key]: createConfigAccessMethods(key)
  }), {})

  const extraMethods = {
    getAll: () => config,
    setAll: (newConfig) => _.forEach(configKeys, key => {
      accessMethods[key].set(newConfig[key])
    })
  }

  return {
    ...accessMethods,
    ...extraMethods,
  }
}
