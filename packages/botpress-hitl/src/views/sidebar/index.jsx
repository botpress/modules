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
    console.log("Pause all:", this.state.allPaused)
  }

  toggleFilter() {
    this.setState({
      filter: !this.state.filter
    })
    console.log("Filter:", this.state.allPaused)
  }

  render() {
    return (
      <div className={style.sidebar}>
        <div className={style.header}>
          <div className={style.allPaused}>
            <h3>Pause all</h3>
            <Toggle className={classnames(style.toggle, style.enabled)}
              defaultChecked={this.state.allPaused}
              onChange={::this.toggleAllPaused}/>
          </div>
          <div className={style.showPaused}>
            <h3>Show paused</h3>
            <Toggle className={classnames(style.toggle, style.enabled)}
              defaultChecked={this.state.filter}
              onChange={::this.toggleFilter}/>
          </div>
        </div>
        <div className={style.users}>
          <User />
          <User />
          <User />
          <User />
          <User />
          <User />   <User />
          <User />
        </div>
      </div>
    )
  }

}
