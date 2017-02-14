import { RTM_EVENTS } from '@slack/client'

import LRU from 'lru-cache'
import Users from './users'

const OTHER_RTM_EVENTS = [
  "ACCOUNTS_CHANGED",
  "BOT_ADDED",
  "BOT_CHANGED",
  "CHANNEL_ARCHIVE",
  "CHANNEL_CREATED",
  "CHANNEL_DELETED",
  "CHANNEL_HISTORY_CHANGED",
  "CHANNEL_JOINED",
  "CHANNEL_LEFT",
  "CHANNEL_MARKED",
  "CHANNEL_RENAME",
  "CHANNEL_UNARCHIVE",
  "COMMANDS_CHANGED",
  "DND_UPDATED",
  "DND_UPDATED_USER",
  "EMAIL_DOMAIN_CHANGED",
  "EMOJI_CHANGED",
  "FILE_CHANGE",
  "FILE_COMMENT_ADDED",
  "FILE_COMMENT_DELETED",
  "FILE_COMMENT_EDITED",
  "FILE_CREATED",
  "FILE_DELETED",
  "FILE_PUBLIC",
  "FILE_UNSHARED",
  "GOODBYE",
  "GROUP_ARCHIVE",
  "GROUP_CLOSE",
  "GROUP_HISTORY_CHANGED",
  "GROUP_JOINED",
  "GROUP_LEFT",
  "GROUP_MARKED",
  "GROUP_OPEN",
  "GROUP_RENAME",
  "GROUP_UNARCHIVE",
  "HELLO",
  "IM_CLOSE",
  "IM_CREATED",
  "IM_HISTORY_CHANGED",
  "IM_MARKED",
  "IM_OPEN",
  "MANUAL_PRESENCE_CHANGE",
  "PIN_ADDED",
  "PIN_REMOVED",
  "PREF_CHANGE",
  "PRESENCE_CHANGE",
  "REACTION_REMOVED",
  "RECONNECT_URL",
  "STAR_ADDED",
  "STAR_REMOVED",
  "SUBTEAM_CREATED",
  "SUBTEAM_SELF_ADDED",
  "SUBTEAM_SELF_REMOVED",
  "SUBTEAM_UPDATED",
  "TEAM_DOMAIN_CHANGE",
  "TEAM_JOIN",
  "TEAM_MIGRATION_STARTED",
  "TEAM_PLAN_CHANGE",
  "TEAM_PREF_CHANGE",
  "TEAM_PROFILE_CHANGE",
  "TEAM_PROFILE_DELETE",
  "TEAM_PROFILE_REORDER",
  "TEAM_RENAME",
  "USER_CHANGE"
]

const mentionRegex = new RegExp(/<@(\w+)>/gi)

module.exports = (bp, slack) => {

  const users = Users(bp, slack)

  const messagesCache = LRU({
    max: 10000,
    maxAge: 60 * 60 * 1000
  })

  const isButtonAction = payload => {
    return payload.message_ts ? true : false
  }

  const isFromBot = event => {
    if (event.bot_id || event.subtype) {
      return true
    }
    return false
  }

  const preprocessEvent = payload => {

    let userId = payload.user
    let channelId = payload.channel
    let ts = payload.ts

    if (isButtonAction(payload)) {
      userId = payload.user.id
      channelId = payload.channel.id
      ts = payload.message_ts
    }

    const mid = `${payload.channel}_${payload.user}_${payload.ts}`

    if (mid && !messagesCache.has(mid)) {
      // We already processed this message
      payload.alreadyProcessed = true
    } else {
      // Mark it as processed
      messagesCache.set(mid, true)
    }

    return users.getOrFetchUserProfile(userId)
  }

  const formatRaw = (raw) => {
    raw.channel = { id: raw.channel }
    raw.user = { id: raw.user }
    raw.team = { id: raw.team }

    return raw
  }

  const router = bp.getRouter('botpress-slack', { 'auth': req => !/\/action-endpoint/i.test(req.originalUrl) })

  router.post('/action-endpoint', (req, res) => {
    const request = JSON.parse(req.body.payload)
    if (!slack.isConnected()) {
      throw new Error("You are not connected and authenticated")
    }

    if (request.token !== slack.config.verificationToken.get()) {
      throw new Error("Verification token are not matching")
    }

    preprocessEvent(request)
    .then(profile => {
      bp.middlewares.sendIncoming({
        platform: 'slack',
        type: 'button',
        user: profile,
        text: 'button',
        raw: request
      })
    })
    
    res.status(200).end()
  })


  slack.rtm.on(RTM_EVENTS['MESSAGE'], function handleRtmMessage(message) {
    if (isFromBot(message)) return

    preprocessEvent(message)
    .then(profile => {
      const raw = formatRaw(message)

      bp.middlewares.sendIncoming({
        platform: 'slack',
        type: message.type,
        user: profile,
        text: message.text,
        raw: raw
      })

      let mentionnedUsers = []
      let match = []
      while(match = mentionRegex.exec(message.text)) {
        mentionnedUsers.push(match[1])
      }

      if (mentionnedUsers.length > 0) {
        raw.mentionnedUsers = mentionnedUsers
        bp.middlewares.sendIncoming({
          platform: 'slack',
          type: 'users_mentioned',
          user: profile,
          text: "Users have been mentioned",
          raw: raw
        })
      }
      
    })
  })

  slack.rtm.on(RTM_EVENTS['REACTION_ADDED'], function handleRtmReactionAdded(reaction) {
    
    if (isFromBot(reaction)) return

    preprocessEvent(reaction)
    .then(profile => {
      bp.middlewares.sendIncoming({
        platform: 'slack',
        type: 'reaction',
        user: profile,
        text: profile.real_name + " reacted using " +reaction.reaction,
        raw: formatRaw(reaction)
      })
    })
  })

  slack.rtm.on(RTM_EVENTS['USER_TYPING'], function handleRtmTypingAdded(typing) {
    if (isFromBot(typing)) return

    preprocessEvent(typing)
    .then(profile => {
      bp.middlewares.sendIncoming({
        platform: 'slack',
        type: 'typing',
        user: profile, 
        text: profile.real_name + " is typing",
        raw: formatRaw(typing)
      })
    })
  })

  slack.rtm.on(RTM_EVENTS['FILE_SHARED'], function handleRtmTypingAdded(file) {
    if (isFromBot(file)) return

    preprocessEvent(file)
    .then(profile => {
      bp.middlewares.sendIncoming({
        platform: 'slack',
        type: 'file',
        user: profile,
        text: profile.real_name + " shared a file",
        raw: formatRaw(file)
      })
    })
  })


  OTHER_RTM_EVENTS.map((rtmEvent) => {
    slack.rtm.on(RTM_EVENTS[rtmEvent], function handleOtherRTMevent(event) {
      
      bp.middlewares.sendIncoming({
        platform: 'slack',
        type: event.type,
        text: "An another type of event occured",
        raw: event
      })  
    })
  })
}
