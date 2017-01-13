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
  name: "Dany Fortin-Simard"
}

export default class HitlModule extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    this.setState({
      loading: false
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
              <Sidebar />
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
