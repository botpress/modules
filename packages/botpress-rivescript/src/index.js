import checkVersion from 'botpress-version-manager'

import path from 'path'
import fs from 'fs-extra'
import _ from 'lodash'

import RiveScript from 'rivescript'

import calls from './calls'
import deliveries from './deliveries'

var rs = null
var utf8 = false

const validateRiveName = (name) => /[A-Z0-9_-]+/i.test(name)

const handleMessage = (event, id, user, platform, sendTo, text, sendText) => {
  const options = {}
  rs.setUservar(id, 'platform', platform)
  rs.setUservars(id, user)
  rs.setUservar(id, 'text', text)
  rs.replyAsync(id, text)
  .then(reply => {
    deliveries.forEach(delivery => {
      if(delivery && delivery.test.test(reply)) {
        const send = (reply, options) => {
          sendText(sendTo, reply, options)
        }
        try {
          delivery.handler(delivery.test.exec(reply), rs, event.bp, event, send)
        } catch(err) {
          event.bp.logger.error(err)
          throw err
        }
        next()
        return
      }
    })
    sendText(sendTo, reply, options)
  })
}

const incomingMiddleware = (event, next) => {
  const { user, channel, platform, bp, text, type, raw, author } = event
  if (platform === 'facebook') {
    if (type !== 'message') {
      return next()
    }
    handleMessage(event, user.id, user, platform, user.id, text, bp.messenger.sendText)
  } else if(platform === "irc") {
    if(type !== "pm") {
      return next()
    }
    const sendTo = (type === "message") ? channel : user
    handleMessage(event, user, user, platform, sendTo, text, bp.irc.sendMessage)
  } else if (platform === "discord") {
    if(type !== "message") {
      return next()
    }
    if(!bp.discord.isPrivate(raw) || bp.discord.isSelf(user.id)) {
      return next()
    }
    handleMessage(event, user.id, author, platform, channel.id, text, bp.discord.sendText)
  } else {
    throw new Error('Unsupported platform: ', platform)
  }
  next()
}

module.exports = {
  init: function(bp) {

    checkVersion(bp, __dirname)
    
    bp.middlewares.register({
      name: 'rivescript.processIncomingMessages',
      order: 10,
      type: 'incoming',
      module: 'botpress-rivescript',
      handler: incomingMiddleware,
      description: 'Processes incoming messages by the RiveScript engine and sends responses'
    })

    bp.rivescript = {
      setUtf8: value => {
        utf8 = value
        if (rs) {
          reloadRiveScript()
        }
      }
    }
  },
  ready: function(bp) {

    const riveDirectory = path.join(bp.dataLocation, 'rivescript')

    if (!fs.existsSync(riveDirectory)) {
      fs.mkdirSync(riveDirectory)
      fs.copySync(path.join(__dirname, '../templates'), riveDirectory)
    }

    const saveMemory = () => {
      if (rs && rs.write) {
        const usersVars = {}
        const users = _.keys(rs._users)
        users.forEach(user => {
          usersVars[user] = rs.getUservars(user)
        })

        bp.db.kvs.set('__rivescript', usersVars, 'brain')
      }
    }
    const restoreMemory = () => {
      bp.logger.debug('[rivescript] Restoring brain')

      bp.db.kvs.get('__rivescript', 'brain')
      .then(content => {
        if (!content) return
        const users = _.keys(content)
        users.forEach(user => rs.setUservars(user, content[user]))
      })
    }

    const reloadRiveScript = () => {
      saveMemory()
      const isUtf8 = /true|1/i.test(process.env.RIVESCRIPT_UTF8) || utf8
      if (isUtf8) {
        bp.logger.debug('[botpress-rivescript]', 'UTF8 mode enabled')
      }
      rs = new RiveScript({ utf8: isUtf8 })

      rs.loadDirectory(riveDirectory, (batchNumber) => {
        rs.sortReplies()
        restoreMemory()
      }, (err) => {
        console.log('Error', err) // TODO clean that
      })

      calls(rs)
    }

    reloadRiveScript()


    setInterval(saveMemory, 30000)
    const router = bp.getRouter('botpress-rivescript')


    router.get('/scripts', (req, res, next) => {
      const data = {}
      const files = fs.readdirSync(riveDirectory)
      for (let file of files) {
        const name = file.replace(/\.rive$/, '')
        const content = fs.readFileSync(path.join(riveDirectory, file)).toString()
        data[name] = content
      }
      res.send(data)
    })

    router.delete('/scripts/:name', (req, res, next) => {
      const { name } = req.params

      if (!name || name.length <= 0 || !validateRiveName(name)) {
        throw new Error('Invalid rivescript name: ' + name)
      }

      const filePath = path.join(riveDirectory, name + '.rive')

      if (!fs.existsSync(filePath)) {
        throw new Error("This script doesn't exist")
      }

      fs.unlinkSync(filePath)

      reloadRiveScript()

      res.sendStatus(200)
    })

    // create a new script
    router.post('/scripts', (req, res, next) => {
      const { name, content, overwrite } = req.body

      if (!name || name.length <= 0 || !validateRiveName(name)) {
        throw new Error('Invalid rivescript name: ' + name)
      }

      const filePath = path.join(riveDirectory, name + '.rive')

      if (!overwrite && fs.existsSync(filePath)) {
        throw new Error("Can't overwrite script: " + name)
      }

      fs.writeFileSync(filePath, content)

      reloadRiveScript()

      res.sendStatus(200)
    })

    router.post('/reset', (req, res, next) => {
      reloadRiveScript()
      res.sendStatus(200)
    })

    router.post('/simulate', (req, res, next) => {
      const { text } = req.body
      rs.replyAsync('local-user', text)
      .then((reply) => {
        deliveries.forEach(delivery => {
          if(delivery && delivery.test.test(reply)) {
            res.send('[Would be delivered by "' + delivery.name + '"]: ' + reply)
            return
          }
        })
        res.send(reply)
      })
    })

  }
}
