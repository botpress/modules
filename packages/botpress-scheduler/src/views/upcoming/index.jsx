import React from 'react'
import {
  Panel,
  Grid,
  Row,
  Col,
  Button,
  FormControl
} from 'react-bootstrap'
import Toggle from 'react-toggle'

import 'react-toggle/style.css'
import style from './style.scss'

export default class Upcoming extends React.Component {

  constructor() {
    super()
  }

  renderTitle() {
    const name = 'Name'
    const time = 'in 5 minutes'
    return <h3><strong>{name}</strong> {time}</h3>
  }

  renderOccuring() {
    const nextOccuring = "in 2 days at 12:00"
    return <div>
      <h4>
        Next occurence
      </h4>
      <p>
        {nextOccuring}
      </p>
    </div>
  }

  renderEnableToggle() {
    return <Toggle className={style.toggle}
      defaultChecked={true}
      onChange={() => console.log('toggle')} />
  }

  renderActionDetails() {
    const action = "bp.messenger.sendText(...)"
    return <div>
      <h4>Action</h4>
      <FormControl
        componentClass="textarea"
        value={action} />
    </div>
  }

  renderButtons() {
    return <div className={style.buttons}>
      <Button bsStyle='success'>Save</Button>
      <Button bsStyle='danger'>Delete</Button>
    </div>
  }

  render() {
    return <Panel className={style.panel}>
      <Grid fluid>
        <Row className={style.header}>
          <Col md={8}>
            {this.renderTitle()}
          </Col>
          <Col md={4}>
            {this.renderEnableToggle()}
          </Col>
        </Row>
        <Row className={style.content}>
          <Col md={12}>
            <Row>
              <Col md={12}>
                {this.renderOccuring()}
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                {this.renderActionDetails()}
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                {this.renderButtons()}
              </Col>
            </Row>
          </Col>
        </Row>
      </Grid>
    </Panel>
  }
}
