import React from 'react'
import {
  Panel,
  Grid,
  Row,
  Col,
  Button,
  FormControl,
  ListGroup,
  ListGroupItem,
  Glyphicon
} from 'react-bootstrap'
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
        <div className={style.messages}>
          <div className={style.innerMessages} id="innerMessages" ref="innerMessages">
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
