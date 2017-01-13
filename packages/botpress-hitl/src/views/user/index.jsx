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

export default class User extends React.Component {

  constructor() {
    super()
  }

  render() {

    return (
      <div className={style.user}>
        <h2>User box</h2>
      </div>
    )
  }

}
