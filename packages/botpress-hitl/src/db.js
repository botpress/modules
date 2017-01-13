const Promise = require('bluebird')
const moment = require('moment')

var knex = null

function initialize() {
  if (!knex) {
    throw new Error('you must initialize the database before')
  }

  return knex.schema.createTableIfNotExists('hitl_sessions', function (table) {
    table.increments('id').primary()
    table.string('platform')
    table.string('userId')
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

  if (event.platform === 'facebook') {
    profileUrl = event.user.profile_pic
  }

  const session = { 
    platform: event.platform,
    userId: event.user.id,
    user_image_url: profileUrl,
    last_event_on: moment().format('x'),
    last_heard_on: moment().format('x'),
    paused: 0,
    paused_trigger: null,
    is_new_session: true
  }

  return knex('hitl_sessions')
  .insert(session)
  .then(results => session.id = results[0])
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

function appendMessageToSession(event, sessionId, direction) {
  const message = {
    ts: moment().format('x'),
    session_id: sessionId,
    type: event.type,
    text: event.text,
    raw_message: event.raw,
    direction: direction
  }

  return knex('hitl_messages')
  .insert(message)
  .then(() => message)
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
  let query = knex('hitl_sessions')

  if (onlyPaused) {
    query = query.where({ paused: 1 })
  }

  return query
  .select(knex.raw("(select count(*) as count from hitl_messages where hitl_messages.session_id = hitl_sessions.id) as count"))
}

module.exports = k => {
  knex = k
  
  return {
    initialize,
    getUserSession,
    setSessionPaused,
    appendMessageToSession,
    getAllSessions
  }
}