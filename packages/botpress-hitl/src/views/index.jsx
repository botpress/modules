import React from 'react'
import {
  Grid,
  Row,
  Col,
  ListGroup,
  ButtonToolbar,
  ButtonGroup,
  Button,
  Badge,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'

import classnames from 'classnames'

import Sidebar from './sidebar'
import Conversation from './conversation'
import Typing from './typing'

import style from './style.scss'

const api = route => '/api/botpress-hitl/' + route

const userConversationData = {
  name: "Dany Fortin-Simard",
  paused: true
}

export default class HitlModule extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    this.fetchAllSessions()
    .then(() => { //TODO: REMOVE THAT
      this.setState({
        sessions: [
            {
              "id": 2,
              "platform": "facebook",
              "userId": "1376093502450904",
              "full_name": "Dany Fortin-Simard",
              "user_image_url": "https://scontent.xx.fbcdn.net/v/t1.0-1/12715224_1025291760845415_914386888548333516_n.jpg?oh=1aa06932b855fe0f7b11df7035a3bc6a&oe=5912ECB3",
              "last_event_on": 1484342951862,
              "last_heard_on": 1484342951862,
              "paused": 1,
              "paused_trigger": null,
              "count": 1,
              "type": "message",
              "text": "Allo",
              "direction": "in"
            },
            {
              "id": 1,
              "platform": "facebook",
              "userId": "1011874175608567",
              "full_name": "Sylvain Perron",
              "user_image_url": "https://scontent.xx.fbcdn.net/t31.0-1/12593899_538788466289434_4364893903957008279_o.jpg",
              "last_event_on": 1484342910630,
              "last_heard_on": 1484342910630,
              "paused": 0,
              "paused_trigger": null,
              "count": 3,
              "type": "message",
              "text": "heyo",
              "direction": "in"
            }
          ]
      })
    })
  }

  getAxios() {
    return this.props.bp.axios
  }

  fetchAllSessions() {
    this.setState({ loading: true })

    return this.getAxios().get("/api/botpress-hitl/sessions")
    .then((res) => {
      console.log(res.data)
      this.setState({
        loading: false,
        sessions: res.data
      })
    })
  }


  renderLoading() {
    return <h1>Loading...</h1>
  }

  render() {

    if (this.state.loading) {
      return this.renderLoading()
    }

    return (
      <div className={style.mainContainer}>
        <Grid>
          <Row>
            <Col md={3} className={style.column}>
              <Sidebar sessions={this.state.sessions}/>
            </Col>
            <Col md={9} className={style.column}>
              <Row>
                <Col md={12}>
                  <Conversation data={userConversationData}/>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Typing />
                </Col>
              </Row>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
