import React from 'react'
import {
  Row,
  Col,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'

import style from './style.scss'
import moment from 'moment'

export default class Message extends React.Component {

  constructor() {
    super()
  }

  renderContent() {
    return (
      <p>
        {this.props.content.text}
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

    const date = moment(this.props.content.ts, 'x').format('DD MMM YYYY [at] LT')

    const tooltip = (
      <Tooltip id="tooltip">{date}</Tooltip>
    )

    if(this.props.content.direction === 'in') {
      return <OverlayTrigger placement="right" overlay={tooltip}>
        {this.renderMessageFromUser()}
      </OverlayTrigger>
    }

    return <OverlayTrigger placement="left" overlay={tooltip}>
      {this.renderMessageFromBot()}
    </OverlayTrigger>

  }

  render() {
    console.log(this.props.content)
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
