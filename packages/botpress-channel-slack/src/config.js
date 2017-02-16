import _ from 'lodash'
import createStorage from './storage'

/**
 * Example:
 *
 * import createConfig from './config'
 *
 * const config = createConfig(bp)
 * const token = config.apiToken.get()
 *
 * // set token
 * config.apiToken.set(NEW_TOKEN)
 */

export default bp => {
  const configKeys = [
    'apiToken',
    'botToken',
    'clientID',
    'clientSecret',
    'hostname',
    'verificationToken',
    'scope'
  ]

  const configDefaults = {
    apiToken: null,
    botToken: null,
    clientID: '',
    clientSecret: '',
    hostname: '',
    verificationToken: '',
    scope: 'admin,bot,chat:write:bot,commands,identify,incoming-webhook'
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
