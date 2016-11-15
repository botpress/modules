const Promise = require('bluebird')
const moment = require('moment')

let knex = null
let skin = null

function initializeDb() {
  if (!knex) {
    throw new Error('you must initialize the database before')
  }

  return knex.schema.createTableIfNotExists('analytics_interactions', function (table) {
    table.increments('id').primary()
    table.timestamp('ts')
    table.string('type')
    table.string('text')
    table.string('user').references('users.id')
    table.enu('direction', ['in', 'out'])
  })
  .then(function() {
    return knex.schema.createTableIfNotExists('analytics_runs', function(table) {
      table.increments('id').primary()
      table.timestamp('ts')
    })
  })
  .then(() => knex)
}

function saveFacebookOut(event) {
  const userId = 'facebook:' + event.raw.to
  const interactionRow = {
    ts: moment(new Date()).format('x'),
    type: event.type,
    text: event.text,
    user: userId,
    direction: 'out'
  }

  return knex('analytics_interactions').insert(interactionRow)
  .then(function(result) { return true })
}

function saveInteractionIn(event) {
  return skin.db.saveUser({
    id: event.user.id,
    platform: event.platform,
    gender: event.user.gender,
    timezone: event.user.timezone,
    locale: event.user.locale,
  })
  .then(() => {
    const interactionRow = {
      ts: moment(new Date()).format('x'),
      type: event.type,
      text: event.text,
      user: event.platform + ':' + event.user.id,
      direction: 'in'
    }

    return knex('analytics_interactions').insert(interactionRow)
  })
}

function saveInteractionOut(event) {
  if(event.platform === 'facebook') {
    return saveFacebookOut(event)
  }
}

module.exports = (k, s) => {
  knex = k
  skin = s

  return {
    initializeDb: initializeDb,
    saveIncoming: saveInteractionIn,
    saveOutgoing: saveInteractionOut
  }
}
