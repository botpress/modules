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

import 'react-toggle/style.css'
import style from './style.scss'


export default class Message extends React.Component {

  constructor() {
    super()
  }

  renderContent() {
    return this.props.content.message
  }

  renderMessageFromUser() {
    return (
      <div className={style.message + ' ' + style.fromUser}>
        {this.renderContent()}
      </div>
    )
  }

  renderMessageFromBot() {
    return (
      <div className={style.message + ' ' + style.fromBot}>
        {this.renderContent()}
      </div>
    )
  }

  renderMessage() {
    if(this.props.content.fromUser) {
      return this.renderMessageFromUser()
    }
    return this.renderMessageFromBot()
  }

  render() {
    return (
      // Left side
      <Row>
        <Col md={12}>
          {this.renderMessage()}
        </Col>
      </Row>
    )
  }
}
