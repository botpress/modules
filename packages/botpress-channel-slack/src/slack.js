import { RtmClient, CLIENT_EVENTS, RTM_EVENTS, WebClient } from '@slack/client'
import incoming from './incoming'

import axios from 'axios'
import Promise from 'bluebird'

class Slack {
  constructor(bp, config) {

    if (!bp || !config) {
      throw new Error('You need to specify botpress and config')
    }

    this.rtm = null
    this.config = config
    this.connected = false
  }


  validateConnection() {
    if(!this.connected) {
      throw new Error("You are not connected...")
    }
  }

  validateText(text) {
    const type = typeof(text)
    if ( type !== 'string') {
      throw new Error("Text format is not valid (actual: " + type + ", required: string)")
    }  
  }

  validateChannelId(channelId) {
    const type = typeof(channelId)
    if ( type !== 'string') {
      throw new Error("Channel id format is not valid (actual: " + type + ", required: string)")
    }  
  }

  validateAttachments(attachments) {
    const type = typeof(attachments)
    if ( type !== 'object') {
      throw new Error("Attachments format is not valid (actual: " + type + ", required: object)")
    }  
  }

  validateOptions(options) {
    const type = typeof(options)
    if ( type !== 'object') {
      throw new Error("Options format is not valid (actual: " + type + ", required: object)")
    }  
  }

  validateBeforeSending(channelId, options) {
    this.validateConnection()
    this.validateChannelId(channelId)
    this.validateOptions(options)
  }

  sendText(channelId, text, options) {
    this.validateBeforeSending(channelId, options)
    this.validateText(text)

    return Promise.fromCallback(cb => {
      this.web.chat.postMessage(channelId, text, options, cb)
    })
  }

  sendUpdateText(ts, channelId, text, options) {
    this.validateBeforeSending(channelId, options)
    this.validateText(text)

    return Promise.fromCallback(cb => {
      this.web.chat.update(ts, channelId, text, options, cb)
    })
  }

  sendAttachments(channelId, attachments, options) {
    this.validateBeforeSending(channelId, options)
    this.validateAttachments(attachments)
  
    return Promise.fromCallback(cb => {
      this.web.chat.postMessage(channelId, null, {
        attachments,
        ...options
      }, cb)
    })
  }

  sendUpdateAttachments(ts, channelId, attachments, options ) {
    this.validateBeforeSending(channelId, options)
    this.validateAttachments(attachments)

    return Promise.fromCallback(cb => {
      this.web.chat.update(ts, channelId, null, {
        attachments,
        ...options
      }, cb)
    })
  }

  isConnected() {
    return this.connected
  }

  getData() {
    return this.data
  }

  getUserProfile(userId) {
    const url = "https://slack.com/api/users.profile.get" +
      "?token=" + this.config.apiToken.get() +
      "&user=" + userId +
      "&includes_labels=true"

    return axios.get(url)
      .then(({data}) => {
        if (!data.ok) {
          throw new Error("Error getting user profile:" + userId )
        }

        return data.profile
      })
      .catch(err => console.log(`Error getting user profile: ${err}`))
  }

  connectRTM(bp, apiToken) {
    if (this.connected) {
      this.disconnect()
    }

    this.rtm = new RtmClient(apiToken)

    this.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
      bp.logger.info('slack connector is authenticated')
      this.data = rtmStartData
      this.channels = this.data.channels
    })

    this.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
      bp.logger.info('slack connector is connected')
      this.connected = true
      incoming(bp, this)
    })

    this.rtm.start()
  }

  connectWebclient(apiToken) {
    this.web = new WebClient(apiToken)
  }


  connect(bp) {
    const apiToken = this.config.apiToken.get()

    if(!apiToken) return

    this.connectRTM(bp, apiToken)
    this.connectWebclient(apiToken)
  }

  disconnect() {
    this.rtm.disconnect()
  }
}

module.exports = Slack
