const Promise = require('bluebird')
const EventEmitter = require('eventemitter2')
const fetch = require('node-fetch')
const bodyParser = require('body-parser')
import _ from 'lodash'
import db from './db'

fetch.promise = Promise

let webhooks = null

class Webhooks extends EventEmitter {
  constructor(bp) {
    super()
    if (!bp) {
      throw new Error('You need to specify botpress')
    }

    this.app = bp.getRouter('botpress-webhook')

    this.app.use(bodyParser.json({}))

    this.app.post('/webhook/:platform', (req, res) => {
      if (_.includes(platforms, req.params.platform)) {
        var text = req.query['text'] ? req.query['text'] : '';
        var type = req.query['type'] ? req.query['type'] : 'default';
        this.emit('webhook',{
          body: req.body,
          platform: req.params.platform,
          text: text,
          type: type
        })
        res.sendStatus(200)
      } else {
        res.sendStatus(404)
      }
    })
  }
}

let platforms = null
  
module.exports = {
  init: function(bp) {
    db(bp).bootstrap()
    .then(db(bp).listPlatforms)
    .then(pfms => platforms = pfms)
  },
  ready: function(bp) {

    webhooks = new Webhooks(bp)

    webhooks.on('webhook', e => {
      //bp.logger.debug('[webhooks] ' + JSON.stringify(e))
      bp.middlewares.sendIncoming({
        platform: e.platform,
        type: e.type,
        text: e.text,
        raw: e.body
      })
    })

    const router = bp.getRouter('botpress-webhook')

    const updatePlatforms = () => {
      return db(bp).listPlatforms()
      .then(pfms => platforms = pfms)
    }

    router.get('/platforms', (req, res) => {
      db(bp).listPlatforms()
      .then(pfms => res.send(pfms))
    })

    router.put('/platforms/:platform', (req, res) => {
      db(bp).create(req.params.platform)
      .then(() => res.sendStatus(200))
      .then(updatePlatforms)
    })

    router.delete('/platforms/:platform', (req, res) => {
      db(bp).delete(req.params.platform)
      .then(() => res.sendStatus(200))
      .then(updatePlatforms)
    })
  }
}
