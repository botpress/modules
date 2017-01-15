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
  }

  scrollToBottom() {
    const messageScrollDiv = this.refs.innerMessages
    messageScrollDiv.scrollTop = messageScrollDiv.scrollHeight
  }

  togglePaused() {
    this.props.data.props = !this.props.data.props
    console.log("ACTION, pause: ", this.props.data.props)
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
