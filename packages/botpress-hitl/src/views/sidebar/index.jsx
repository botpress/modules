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
  }

  render() {

    return (
      <div className={style.sidebar}>
        <div className={style.header}>
          Header sidebar
        </div>
        <div className={style.users}>
          <User />
        </div>
      </div>
    )
  }

}
