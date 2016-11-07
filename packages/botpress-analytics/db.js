const Promise = require('bluebird')

var knex = null

function getDb(dbFile) {
  if(knex) { 
    return Promise.resolve(knex)
  }

  knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: dbFile
    },
    useNullAsDefault: true
  })

  return initializeDb()
}

function initializeDb() {
  if (!knex) {
    throw new Error('you must initialize the database before')
  }

  return knex.schema.createTableIfNotExists('users', function (table) {
    table.string('id').primary()
    table.string('userId')
    table.string('platform')
    table.enu('gender', ['unknown', 'male', 'female'])
    table.integer('timezone')
    table.string('locale')
    table.timestamp('created_on')
  })
  .then(function() {
    return knex.schema.createTableIfNotExists('interactions', function (table) {
      table.increments('id').primary()
      table.timestamp('ts')
      table.string('type')
      table.string('text')
      table.string('user').references('users.id')
      table.enu('direction', ['in', 'out'])
    })
  })
  .then(() => knex)
}

function saveFacebookIn(event) {
  const userId = 'facebook:' + event.user.id
  const userRow = {
    id: userId,
    userId: event.user.id,
    platform: 'facebook',
    gender: event.user.gender || 'unknown',
    timezone: event.user.timezone || null,
    locale: event.user.locale || null,
    created_on: new Date()
  }

  const interactionRow = {
    ts: new Date(),
    type: event.type,
    text: event.text,
    user: userId,
    direction: 'in'
  }

  var query = knex('users').insert(userRow)
  .where(function() {
    return this.select(knex.raw(1)).from('users').where('id', '=', userId)
  })
  query = query.toString().replace(/^insert/i, 'insert or ignore')

  return knex.raw(query)
  .then(function() {
    return knex('interactions').insert(interactionRow)
  })
}

function saveFacebookOut(event) {
  const userId = 'facebook:' + event.raw.to
  const interactionRow = {
    ts: new Date(),
    type: event.type,
    text: event.text,
    user: userId,
    direction: 'out'
  }

  return knex('interactions').insert(interactionRow)
  .then(function(result) { return true })
}

function saveInteractionIn(event) {
  if(event.platform === 'facebook') {
    return saveFacebookIn(event)
  }
}

function saveInteractionOut(event) {
  if(event.platform === 'facebook') {
    return saveFacebookOut(event)
  }
}

module.exports = {
  getOrCreate: getDb,
  saveIncoming: saveInteractionIn,
  saveOutgoing: saveInteractionOut
}
