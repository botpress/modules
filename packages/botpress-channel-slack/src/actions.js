'use strict'

const _ = require('lodash')

const validateChannelId = (channelId) => {
  if (!/\w+/.test(channelId)) {
    throw new Error('Invalid channel id')
  }
}

const validateText = (text) => {
  if (typeof(text) !== 'string') {
    throw new Error('Text must be a string.')
  }
}

const validateAttachments = (attachments) => {
  if (typeof(attachments) !== 'object') {
    throw new Error('Expected attachments type to be an object')
  }
}

const createText = (channelId, text, options = {}) => {
  validateChannelId(channelId)
  validateText(text)

  return {
    platform: 'slack',
    type: 'text',
    text: text,
    raw: {
      channelId: channelId,
      options: options
    }
  }
}

const createAttachments = (channelId, attachments, options = {}) => {
  validateChannelId(channelId)
  validateAttachments(attachments)

  return {
    platform: 'slack',
    type: 'attachments',
    text: 'App sent an attachments',
    raw: {
      channelId: channelId,
      attachments: attachments,
      options: options
    }
  }
}

const createUpdateText = (ts, channelId, text, options = {}) => {
  validateChannelId(channelId)
  validateText(text)

  return {
    platform: 'slack',
    type: 'update_text',
    text: text,
    raw: {
      channelId: channelId,
      ts: ts,
      options: options
    }
  }
} 

const createUpdateAttachments = (ts, channelId, attachments, options = {}) => {
  validateChannelId(channelId)
  validateAttachments(attachments)

  return {
    platform: 'slack',
    type: 'update_attachments',
    text: "App updated an attachments",
    raw: {
      channelId: channelId,
      attachments: attachments,
      ts: ts,
      options: options
    }
  }
} 

module.exports = {
  createText,
  createAttachments,
  createUpdateText,
  createUpdateAttachments
}
