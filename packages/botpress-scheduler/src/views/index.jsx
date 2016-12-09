import React from 'react'
import {
  Grid,
  Row,
  Col
} from 'react-bootstrap'

import Previous from './previous'
import Upcoming from './upcoming'
import ScheduleModal from  './scheduleModal'

import style from './style.scss'

export default class SchedulerModule extends React.Component {

  render() {
    return (
      <Grid>
        <Row>
          <Col mdOffset={1} md={10}>
            <Previous />
            <Upcoming />
            <ScheduleModal />
          </Col>
        </Row>
      </Grid>
    )
  }
}
