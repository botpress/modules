import mkdirp from 'mkdirp'
import path from 'path'
import _ from 'lodash'
import Promise from 'bluebird'

import Parser from './parser'

const formatFilename = name =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/gi, '_')
    .replace('.intent.md', '')
    .replace('.entity.md', '')

export default class Storage {
  constructor({ bp, config }) {
    this.ghost = bp.ghostManager
    this.intentsDir = config.intentsDir
    this.entitiesDir = config.entitiesDir
    this.projectDir = bp.projectLocation
    this.parser = new Parser()
  }

  async initializeGhost() {
    mkdirp.sync(path.resolve(this.projectDir, this.intentsDir))
    mkdirp.sync(path.resolve(this.projectDir, this.entitiesDir))
    await this.ghost.addRootFolder(this.intentsDir, '**/*.intent.md')
    await this.ghost.addRootFolder(this.entitiesDir, '**/*.entity.md')
  }

  async saveIntent(intent, content) {
    intent = formatFilename(intent)

    if (intent.length < 1) {
      throw new Error('Invalid intent name, expected at least one character')
    }

    const filename = `${intent}.intent.md`

    await this.ghost.upsertFile(this.intentsDir, filename, content)
  }

  async deleteIntent(intent) {
    intent = formatFilename(intent)

    if (intent.length < 1) {
      throw new Error('Invalid intent name, expected at least one character')
    }

    const filename = `${intent}.intent.md`

    await this.ghost.deleteFile(this.intentsDir, filename)
  }

  async getIntents() {
    const intents = await this.ghost.directoryListing(this.intentsDir, '*.intent.md')

    return await Promise.mapSeries(intents, intent => this.getIntent(intent))
  }

  async getIntent(intent) {
    intent = formatFilename(intent)

    if (intent.length < 1) {
      throw new Error('Invalid intent name, expected at least one character')
    }

    const filename = `${intent}.intent.md`

    const content = await this.ghost.readFile(this.intentsDir, filename)

    return {
      name: intent,
      filename: filename,
      content: content
    }
  }
}
