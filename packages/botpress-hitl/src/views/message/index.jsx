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
  Glyphicon,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'
import Toggle from 'react-toggle'

import 'react-toggle/style.css'
import style from './style.scss'


export default class Message extends React.Component {

  constructor() {
    super()
  }

  renderContent() {
    return (
      <p>
        {this.props.content.message}
      </p>
    )
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
    const tooltip = (
      <Tooltip id="tooltip">{this.props.content.date}</Tooltip>
    )

    if(this.props.content.fromUser) {
      return <OverlayTrigger placement="right" overlay={tooltip}>
        {this.renderMessageFromUser()}
      </OverlayTrigger>
    }
    return <OverlayTrigger placement="left" overlay={tooltip}>
      {this.renderMessageFromBot()}
    </OverlayTrigger>

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
