import React from 'react'
import Toggle from 'react-toggle'
import classnames from 'classnames'

import 'react-toggle/style.css'
import style from './style.scss'

import Message from '../message'

export default class Conversation extends React.Component {
  constructor() {
    super()

    this.state = { loading: true, messages: null }
    this.appendMessage = ::this.appendMessage
  }

  scrollToBottom() {
    const messageScrollDiv = this.refs.innerMessages
    messageScrollDiv.scrollTop = messageScrollDiv.scrollHeight
  }

  componentDidMount() {
    this.props.bp.events.on('hitl.message', this.appendMessage)
  }

  componentWillUnmount() {
    this.props.bp.events.off('hitl.message', this.appendMessage)
  }

  appendMessage(message) {
    if (this.state.messages && this.props.data.id === message.session_id) {
      this.setState({ messages: [...this.state.messages, message] })
      setTimeout(::this.scrollToBottom, 50)
    }
  }

  togglePaused() {
    this.props.data.props = !this.props.data.props
    const sessionId = this.props.data.id
    const action = !!this.props.data.paused ? 'unpause' : 'pause'
    this.getAxios().post(`/api/botpress-hitl/sessions/${sessionId}/${action}`)
  }

  getAxios() {
    return this.props.bp.axios
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.data || nextProps.data.id !== this.props.data.id) {
      this.fetchSessionMessages(nextProps.data.id)
    }
  }

  fetchSessionMessages(sessionId) {
    this.setState({ loading: true })

    return this.getAxios().get('/api/botpress-hitl/sessions/' + sessionId)
    .then(({ data }) => {
      this.setState({
        loading: false,
        messages: data
      })

      setTimeout(::this.scrollToBottom, 50)
    })
  }

  render() {
    const dynamicHeightStyleMessageDiv = {
      height: innerHeight - 260
    }

    const dynamicHeightStyleInnerMessageDiv = {
      maxHeight: innerHeight - 260
    }

    return (
      <div className={style.conversation}>
        <div className={style.header}>
          <h3>
            {this.props.data && this.props.data.full_name}
          </h3>
          <Toggle className={classnames(style.toggle, style.enabled)}
            defaultChecked={this.props.data && !!this.props.data.paused}
            onChange={::this.togglePaused}/>
        </div>
        <div className={style.messages} style={dynamicHeightStyleMessageDiv}>
          <div className={style.innerMessages}
            id="innerMessages"
            ref="innerMessages"
            style={dynamicHeightStyleInnerMessageDiv}>
            {this.state.messages && this.state.messages.map((m, i) => {
              return <Message key={i} content={m}/>
            })}
          </div>
        </div>
      </div>
    )
  }
}
