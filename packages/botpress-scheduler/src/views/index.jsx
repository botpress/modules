import React from 'react'

import Previous from './previous'
import Upcoming from './upcoming'
import ScheduleModal from  './scheduleModal'

import style from './style.scss'

export default class SchedulerModule extends React.Component {

  render() {
    return (
      <div>
        <Previous />
        <Upcoming />
        <ScheduleModal />
      </div>
    )
  }
}
