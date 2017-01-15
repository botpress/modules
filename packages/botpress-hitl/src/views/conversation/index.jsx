import React from 'react'
import Toggle from 'react-toggle'
import classnames from 'classnames'

import 'react-toggle/style.css'
import style from './style.scss'

import Message from '../message'

const userMessage = {
  type: 'text',
  fromUser: true,
  message: 'Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla',
  date: '10:27am'
}

const botMessage = {
  type: 'text',
  fromUser: false,
  message: 'Bla bla bla',
  date: '10:32am'
}

export default class Conversation extends React.Component {
  constructor() {
    super()
  }

  componentDidMount() {
    const messageScrollDiv = this.refs.innerMessages
    messageScrollDiv.scrollTop = messageScrollDiv.scrollHeight
  }

  togglePaused() {
    this.props.data.props = !this.props.data.props
    console.log("ACTION, pause: ", this.props.data.props)
  }


  render() {
    const dynamicHeightStyleMessageDiv = {
      height: screen.height - 240
    }

    const dynamicHeightStyleInnerMessageDiv = {
      maxHeight: screen.height - 240
    }

    return (
      <div className={style.conversation}>
        <div className={style.header}>
          <h3>
            {this.props.data.name}
          </h3>
          <Toggle className={classnames(style.toggle, style.enabled)}
            defaultChecked={this.props.data.paused}
            onChange={::this.togglePaused}/>
        </div>
        <div className={style.messages} style={dynamicHeightStyleMessageDiv}>
          <div className={style.innerMessages}
            id="innerMessages"
            ref="innerMessages"
            style={dynamicHeightStyleInnerMessageDiv}>
            <Message content={userMessage}/>
            <Message content={botMessage}/>
              <Message content={userMessage}/>
              <Message content={botMessage}/>
                <Message content={userMessage}/>
                <Message content={botMessage}/>
                  <Message content={userMessage}/>
                  <Message content={botMessage}/>
          </div>
        </div>
      </div>
    )
  }
}
