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
import moment from 'moment'

import 'react-toggle/style.css'
import style from './style.scss'

const user = {
  name: "Dany Fortin-Simard",
  img: 'https://scontent-lga3-1.xx.fbcdn.net/v/t1.0-9/12715224_1025291760845415_914386888548333516_n.jpg?oh=9e4777351bdf48b3d93461f0ae8fe9e9&oe=58E17959',
  lastMessage: "Bla bla bla bla bla bla bla bla bla bla bla bla",
  lastDate: "10:26am",
  paused: true
}

export default class User extends React.Component {

  constructor() {
    super()

    this.state = {
      displayImg: 'block'
    }
  }

  changeSession() {
    console.log("ACTION, session")
  }

  onErrorLoadingImage() {
    this.setState({
      displayImg: 'none'
    })
  }

  render() {
    const imgStyle = {
      display: this.state.displayImg,
      backgroundColor: 'blue'
    }
    
    const dateFormatted = moment(this.props.session.last_event_on, 'x').format('LT')

    return (
      <div className={style.user} onClick={::this.changeSession}>
        {this.props.session.paused == 1 ? <i className="material-icons">pause_circle_filled</i> : null}
        <div className={style.imgContainer}>
          <img src={this.props.session.user_image_url} onError={::this.onErrorLoadingImage} style={imgStyle}/>
        </div>
        <div className={style.content}>
          <h3>{this.props.session.full_name}</h3>
          <h4>{this.props.session.text}</h4>
        </div>
        <div className={style.date}>
          <h5>{dateFormatted}</h5>
        </div>
      </div>
    )
  }
}
