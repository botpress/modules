import React from 'react'
import {
  Panel,
  Grid,
  Row,
  Col,
  ControlLabel
} from 'react-bootstrap'

import style from './style.scss'

export default class TemplateModule extends React.Component {


  renderAccessToken() {
    return (
      <Row>
        <Col md={3}>
          <ControlLabel>Access token</ControlLabel>
        </Col>
        <Col md={9}>

        </Col>
      </Row>
    )
  }

  render() {
    return (
      <Panel header="settings">
        <Grid>
          {this.renderAccessToken()}
        </Grid>
      </Panel>
    )
  }
}
