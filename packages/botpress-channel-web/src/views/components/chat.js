import React from 'react'
import ReactDOM from 'react-dom'
import MessageList from './message-list'
import Composer from './composer'
import Dropzone from 'react-dropzone'

import parentStyle from '../style.scss'
import style from './style.scss'

// FIXME:
// - Update open to use dropzone
// - dropzone hover effect
// - and to generate preview
class Chat extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      messages: [],
      typing: false
    }

    this.session = props.session
  }

  componentDidMount() {

    this.session.on('message', message => {
      var messages = this.state.messages.map(m => m)
      messages.push(message)

      this.setState({
        messages: messages,
        typing: this.props.typing && message.class !== 'bot'
      })

    })

    this.session.on('session_started', () => {
      this.setState({
        messages: [],
        typing: false
      })
    })

    this.session.on('typing', msg => {
      this.setState({
        typing: true
      })
    })
  }

  render() {
    const header = <div className={style.header}>
      <h1>Bottr</h1>
    </div>

    const sayHi = () => this.session.send('Hello')

    return (
      <Dropzone className={parentStyle.chat} onDrop={this.onUpload.bind(this)} disableClick={true}>
        <MessageList showWelcome={this.props.showWelcome} messages={this.state.messages} typing={this.state.typing} onInitiate={sayHi}/>
        <Composer onSubmit={::this.onSubmit} onUpload={::this.onUpload}/>
      </Dropzone>
    )
  }

  onSubmit(text) {
    this.session.send(text)
  }

  onUpload(files) {
     for (var i = 0, f; f = files[i]; i++) {
       this.session.send(f)
     }
  }
}

module.exports = Chat
