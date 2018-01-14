const ENVIRONEMENT = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'

export default class Provider {
  constructor(name, logger, storage, parser) {
    this.name = name
    this.logger = logger
    this.storage = storage
    this.parser = parser
  }

  async publish() {
    throw new Error('Not implemented')
  }

  async sync() {
    throw new Error('Not implemented')
  }

  async checkSyncNeeded() {
    // TODO Implement this here
  }

  async extractEntities(incomingText) {
    throw new Error('Not implemented')
  }

  async classifyIntent(incomingText) {
    throw new Error('Not implemented')
  }
}
