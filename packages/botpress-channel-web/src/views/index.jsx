import React from 'react'
import classnames from 'classnames'

import Resizable from 'react-resizable-box'

import Chat from './components/chat' // Deprecated
import ChatSession from './components/chat-session' // Deprecated

import WebComponent from './web'
import UMMComponent from './UMM'

import style from './style.scss'

export default class UMMModule extends React.Component {

  constructor(props) {
    super()
    this.session = new ChatSession({ events: props.bp.events })
  }

  render() {
    const className = classnames(style.chatComponent, 'bp-modules-chat')
    return <div>
      <h3>There is nothing to see here, yet.</h3>
      <p>This module currently serves to show the Chat Emulator you see at the bottom of your screen. 
      Uninstall this module to get rid of it.</p>
      <p>This module is a work in progress, it will also allow you to embed a chat window to your bot on any website (no ETA yet, please contact us on Slack).</p>
    </div>
  }
}

export class Embedded extends React.Component { // Deprecated

  constructor(props) {
    super()
    this.session = new ChatSession({ events: props.bp.events })
  }

  render() {
    const className = classnames(style.chatComponent, 'bp-modules-chat')
    return <div className={style.embedded}>
      <Chat
        className={className}
        session={this.session} />
    </div>
  }
}

export class Emulator extends React.Component { // Deprecated

  constructor(props) {
    super()
    this.session = new ChatSession({ events: props.bp.events })
    this.resizable = null
    this.state = {
      collapsed: false
    }
  }
  
  toggleCollapsed() {
    if (!this.state.collapsed) {
      const originalHeight = this.resizable.state.height
      const originalWidth = this.resizable.state.width
      this.resizable.updateSize({ height: 40 })
      this.setState({ originalHeight, originalWidth, collapsed: true })
    } else {
      this.resizable.updateSize({ height: this.state.originalHeight, width: this.state.originalWidth })
      this.setState({ collapsed: false })
    }
  }

  startNewSession(event) {
    event.preventDefault()
    event.stopPropagation()
    
    this.session.startNewSession()
  }

  componentDidMount() {
    const className = classnames(style.chatComponent, 'bp-modules-chat')

    const chatComponent = <Chat
      showWelcome={true}
      className={className}
      session={this.session} />

    this.setState({ chatComponent })
  }

  render() {
    const minHeight = this.state.collapsed ? 40 : 400
    const maxheight = this.state.collapsed ? 40 : 1000

    const emulatorStyle = classnames(style.emulator, {
      [style.hidden]: this.state.collapsed
    })

    return <div className={emulatorStyle}>
      <Resizable
        ref={c => { this.resizable = c }}
        width={300}
        height={400}
        minWidth={300}
        minHeight={minHeight}
        maxHeight={maxheight}
        enable={{
          top: true,
          right: true,
          topLeft: true,
          left: true,
          topRight: true,
          bottom: false, // Disable bottom because sticks in bottom left corner
          bottomRight: false,
          bottomLeft: false
        }}>
        <div className={style.header} onClick={::this.toggleCollapsed}>
          <div className={style.left}>Emulator</div>
          <div className={style.right}>
            <span className={style.button} onClick={::this.startNewSession}>
              <i className="icon material-icons">refresh</i>
            </span>
          </div>
        </div>
        {this.state.chatComponent}
      </Resizable>
    </div>
  }
}

export class Web extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <WebComponent />
  }
}

export class UMMOutgoing extends React.Component {
  constructor(props) {
    super()
  }

  render() {
    return <UMMComponent {...this.props} />
  }
}

export class WebInjection extends React.Component {
  render () {
    var node = window.document.createElement('script')
    node.src = '/api/botpress-platform-webchat/inject.js'
    window.document.body.appendChild(node)
  }
}

export class WebBotpressUIInjection extends React.Component {
  render () {
    if (document.querySelector('#botpress-platform-webchat-injection')) return null;

    var node = window.document.createElement('script')
    node.src = '/api/botpress-platform-webchat/inject.js'
    node.id = 'botpress-platform-webchat-injection'
    node.dataset.optionsJson = JSON.stringify({ hideWidget: true })

    window.document.body.appendChild(node)

    let button = document.createElement('li')
    const buttonOptions = {
      role: 'presentation',
      onclick: () => botpressChat('show'),
      innerHTML: `<a role="button" href="#">
                    <span class="bp-full-screen">
                      <span class="glyphicon glyphicon-comment"></span>
                    </span>
                  </a>`
    }
    Object.keys(buttonOptions).forEach(key => button[key] = buttonOptions[key])
    document.querySelector('.nav.navbar-nav').appendChild(button)
  }
}
