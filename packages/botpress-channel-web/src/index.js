import fs from 'fs'
import path from 'path'

import umm from './umm'
import api from './api'
import socket from './socket'
import db from './db'

import configTemplate from 'raw!./botpress-platform-webchat.config.yml'

const createConfigFile = bp => {
  const name = 'botpress-platform-webchat.config.yml'
  const file = path.join(bp.projectLocation, name)

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, configTemplate)

    bp.notifications.send({
      level: 'info',
      message: name + ' has been created, fill it'
    })
  }
}

module.exports = {

  config: {
    locale: { type: 'string', required: false, default: 'en-US' },

    botName: { type: 'string', required: false, default: 'Bot' },
    botAvatarUrl: { type: 'any', required: false, default: null },
    botConvoTitle: { type: 'string', required: false, default: 'Support'},

    welcomeMsgEnable: { type: 'bool', required: false, default: false },
    welcomeMsgDelay: { type: 'any', required: false, default: 5000 },
    welcomeMsgText: { type: 'string', required: false, default: ''},

    backgroundColor: { type: 'string', required: false, default: '#000000' },
    textColorOnBackground: { type: 'string', required: false, default: '#666666' },
    foregroundColor: { type: 'string', required: false, default: '#0176ff' },
    textColorOnForeground: { type: 'string', required: false, default: '#ffffff' },

    uploadsUseS3: { type: 'bool', required: false, default: false, env: 'WEBCHAT_USE_S3' },
    uploadsS3Bucket: { type: 'string', required: false, default: 'bucket-name', env: 'WEBCHAT_S3_BUCKET' },
    uploadsS3Region: { type: 'any', required: false, default: null, env: 'WEBCHAT_S3_REGION' },
    uploadsS3AWSAccessKey: { type: 'any', required: false, default: null, env: 'WEBCHAT_S3_ACCESS_KEY' },
    uploadsS3AWSAccessSecret: { type: 'any', required: false, default: null, env: 'WEBCHAT_S3_KEY_SECRET' }
  },

  init: async function(bp, configurator) {
    const config = await configurator.loadAll()

    // Setup the socket events
    await socket(bp, config)

    bp.middlewares.load() // TODO Fix that

    createConfigFile(bp)

    // Initialize UMM
    return umm(bp)
  },

  ready: async function(bp, configurator) {
    const config = await configurator.loadAll()

    const knex = await bp.db.get()

    // Initialize the database
    db(knex, bp.botfile).initialize()

    // Setup the APIs
    const router = await api(bp, config)

    router.get('/config', async (req, res) => {
      res.json(await configurator.loadAll())
    })

    router.post('/config', async (req, res) => {
      await configurator.saveAll(newConfigs)
      res.json(await configurator.loadAll())
    })
  }
}
