import moment from 'moment'

module.exports = bp => {
  return {
    bootstrap: () => {
      return bp.db.get()
      .then(initialize)
    },
    create: (platform) => {
      return bp.db.get()
      .then(knex => create(knex, platform))
    },
    delete: (platform) => {
      return bp.db.get()
      .then(knex => remove(knex, platform))
    },
    listPlatforms: () => {
      return bp.db.get()
      .then(listPlatforms)
    }
  }
}

function initialize(knex) {
  return knex.schema.createTableIfNotExists('webhooks', function (table) {
    table.increments('id').primary()
    table.timestamp('created_on')
    table.string('platform')
  })
  .then(function() {
    return knex.schema.raw(`create unique index
      if not exists "webhooks_platform_unique" 
      on "webhooks" ("platform")`)
  })
}

function listPlatforms(knex) {
    return knex('webhooks')
      .select('platform')
      .then(pfms => pfms.map(p => p.platform))
}

function create(knex, platform) {
  if (typeof platform !== 'string' || platform.length < 1) {
    throw new Error('Platform must be a valid string')
  }

  return knex('webhooks')
  .insert({
    created_on: moment().format('x'),
    platform: platform
  })
}

function remove(knex, platform) {
  return knex('webhooks')
  .where('platform', platform)
  .del()
}