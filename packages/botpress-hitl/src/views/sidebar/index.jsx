import React from 'react'
import {
  Col,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'

import Toggle from 'react-toggle'
import classnames from 'classnames'

import 'react-toggle/style.css'
import style from './style.scss'

import User from '../user'

export default class Sidebar extends React.Component {

  constructor() {
    super()

    this.state = {
      allPaused: false,
      filter: true
    }
  }

  toggleAllPaused() {
    this.setState({
      allPaused: !this.state.allPaused
    })
    console.log("ACTION, Pause all:", this.state.allPaused)
  }

  toggleFilter() {
    this.setState({
      filter: !this.state.filter
    })
    console.log("ACTION, Filter:", this.state.filter)
  }

  renderUser(value) {
    return <User key={value.id} session={value} setSession={() => this.props.setSession(value.id)}></User>
  }

  render() {
    const filterTooltip = (
      <Tooltip id="tooltip">Show only paused conversations</Tooltip>
    )
    const filterStyle = {
      color: this.state.filter ? '#56c0b2' : '#666666'
    };

    const dynamicHeightUsersDiv = {
      height: innerHeight - 160
    }

    return (
      <div className={style.sidebar}>
        <div className={style.header}>
          <div className={style.allPaused}>
            <h3>Pause bot</h3>
            <Toggle className={classnames(style.toggle, style.enabled)}
              defaultChecked={this.state.allPaused}
              onChange={::this.toggleAllPaused}/>
          </div>
          <div className={style.filter}>
            <OverlayTrigger placement="top" overlay={filterTooltip}>
              <i className="material-icons" style={filterStyle} onClick={::this.toggleFilter}>filter_list</i>
            </OverlayTrigger>
          </div>
        </div>
        <div className={style.users} style={dynamicHeightUsersDiv}>
          {this.props.sessions.sessions.map(::this.renderUser)}
        </div>
      </div>
    )
  }

}
