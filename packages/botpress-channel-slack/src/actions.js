// actions.js
//
// this file contains list of action creators
// (action means the event that are passed through middleware

export const text = (text, channelId) => ({
  platform: 'slack',
  type: 'text',
  text,
  raw: {
    channelId
  }
})
