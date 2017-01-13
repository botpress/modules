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
  message: 'Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla'
}

const botMessage = {
  type: 'text',
  fromUser: false,
  message: 'Bla bla bla'
}

export default class Conversation extends React.Component {

  constructor() {
    super()
  }

  render() {
    return (
      <div className={style.conversation}>
        <div className={style.header}>
          Conversation header
        </div>
        <div className={style.messages}>
          <Message content={userMessage}/>
          <Message content={botMessage}/>
        </div>
      </div>
    )
  }
}
