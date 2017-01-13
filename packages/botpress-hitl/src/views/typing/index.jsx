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

export default class Typing extends React.Component {

  constructor() {
    super()

    this.state = {
      message: ''
    }
  }

  handleChange(event) {
    this.setState({
      message: event.target.value
    });
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      console.log('ACTION: SEND', this.state.message)
      event.preventDefault()
      this.setState({
        message: ''
      });
      return false
    }
  }

  render() {
    return (
      <div className={style.typing}>
        <textarea value={this.state.message} onChange={::this.handleChange} onKeyPress={::this.handleKeyPress} />
      </div>
    )
  }
}
