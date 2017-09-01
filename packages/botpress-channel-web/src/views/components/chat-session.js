import EventEmitter from 'events'

class ChatSession extends EventEmitter {

  constructor({ events }) {
    super()
    this.events = events
    this.userId = null

    events.on('modules.web.message', msg => {
      // Only listen for messages coming from the bot
      if (msg.from !== 'bot') {
        return
      }

      if(msg.__userId !== this.userId) {
        return
      }

      this.emit('message', {
        class: 'bot',
        text: msg.text,
        attachment: msg.attachment
      })
    })

    events.on('modules.web.typing', msg => {
      this.emit('typing')
    })

    events.on('modules.web.session_started', event => {
      this.userId = event.userId
      this.emit('session_started')
    })

    this.startNewSession()
  }

  startNewSession() {
    this.events.emit('modules.web.new_session')
  }

  send(item) {
    if (item instanceof File) {
      this.sendFile(item)
    } else {
      this.sendText(item)
    }
  }

  sendText(text) {
    this.events.emit('modules.web.message', { text: text })
    this.emit('message', {
      class: 'you',
      text: text
    })
  }

  sendFile(file) {

    var reader = new FileReader()

    reader.onload = e => {

      this.emit('message', {
        class: 'you',
        attachment: {
          name: file.name,
          type: file.type,
          data: e.target.result
        }
      })

      this.events.emit('modules.web.message', {
        attachments: [
        {
          type: file.type,
          data: e.target.result
        }
      ]})

    }

    reader.readAsDataURL(file)
  }
}

module.exports = ChatSession
