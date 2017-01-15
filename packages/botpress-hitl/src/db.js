import Promise from 'bluebird'
import moment from 'moment'
import _ from 'lodash'

var knex = null

function initialize() {
  if (!knex) {
    throw new Error('you must initialize the database before')
  }

  return knex.schema.createTableIfNotExists('hitl_sessions', function (table) {
    table.increments('id').primary()
    table.string('platform')
    table.string('userId')
    table.string('full_name')
    table.string('user_image_url')
    table.timestamp('last_event_on')
    table.timestamp('last_heard_on')
    table.boolean('paused')
    table.string('paused_trigger')
  })
  .then(function() {
    return knex.schema.createTableIfNotExists('hitl_messages', function (table) {
      table.increments('id').primary()
      table.integer('session_id').references('hitl_sessions.id').onDelete('CASCADE')
      table.string('type')
      table.string('text')
      table.jsonb('raw_message')
      table.enu('direction', ['in', 'out'])
      table.timestamp('ts')
    })
  })
}

function createUserSession(event) {
  let profileUrl = null
  let full_name = event.user.id

  if (event.platform === 'facebook') {
    profileUrl = event.user.profile_pic
    full_name = event.user.first_name + ' ' + event.user.last_name
  }

  const session = { 
    platform: event.platform,
    userId: event.user.id,
    user_image_url: profileUrl,
    last_event_on: moment().format('x'),
    last_heard_on: moment().format('x'),
    paused: 0,
    full_name: full_name,
    paused_trigger: null
  }

  return knex('hitl_sessions')
  .insert(session)
  .then(results => { 
    session.id = results[0]
    session.is_new_session = true
  })
  .then(() => session)
}

function getUserSession(event) {
  return knex('hitl_sessions')
  .where({ platform: event.platform, userId: event.user.id })
  .select('*')
  .limit(1)
  .then(users => {
    if (!users || users.length === 0) {
      return createUserSession(event)
    } else {
      return users[0]
    }
  })
}

function getSession(sessionId) {
  return knex('hitl_sessions')
  .where({ id: sessionId })
  .select('*')
  .limit(1)
  .then(users => {
    if (!users || users.length === 0) {
      return null
    } else {
      return users[0]
    }
  })
}

function appendMessageToSession(event, sessionId, direction) {
  const message = {
    ts: moment().format('x'),
    session_id: sessionId,
    type: event.type,
    text: event.text,
    raw_message: event.raw,
    direction: direction
  }

  const update = { last_event_on: moment().format('x') }

  if (direction === 'in') {
    update.last_heard_on = moment().format('x')
  }

  return knex('hitl_messages')
  .insert(message)
  .then(() => {
    return knex('hitl_sessions')
    .where({ id: sessionId })
    .update(update)
    .then(() => message)
  })
}

function setSessionPaused(paused, platform, userId, trigger, sessionId = null) {
  if (sessionId) {
    return knex('hitl_sessions')
    .where({ id: sessionId })
    .update({ paused: paused ? 1 : 0, paused_trigger: trigger })
    .then()
  } else {
    return knex('hitl_sessions')
    .where({ userId, platform })
    .update({ paused: paused ? 1 : 0, paused_trigger: trigger })
    .then()
  }
}

function getAllSessions(onlyPaused = false) {
  let condition = ''

  if (onlyPaused) {
    condition = 'where hitl_sessions.paused = 1'
  }

  return knex('hitl_sessions')
  .select(knex.raw('count(*) as count'))
  .then(results => {
    return knex.raw(`
      select hitl_sessions.*, count(*) as count, hitl_messages.type, hitl_messages.text, hitl_messages.direction
      from hitl_messages
      join hitl_sessions on hitl_sessions.id = hitl_messages.session_id
      ${condition}
      group by hitl_sessions.id
      order by hitl_messages.id desc
      limit 100`)
    .then(sessions => ({
      total: results[0].count,
      sessions: sessions
    }))
  })
}

function getSessionData(sessionId) {
  return knex('hitl_sessions')
  .where({ 'session_id': sessionId })
  .join('hitl_messages', 'hitl_messages.session_id', 'hitl_sessions.id')
  .select('*')
  .orderBy('id', 'desc')
  .limit(100)
  .then(messages => _.orderBy(messages, ['ts'], ['asc']))
}

module.exports = k => {
  knex = k

  return {
    initialize,
    getUserSession,
    setSessionPaused,
    appendMessageToSession,
    getAllSessions,
    getSessionData,
    getSession
  }
}