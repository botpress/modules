import React from 'react'
import {
  Grid,
  Row,
  Col
} from 'react-bootstrap'

import Sidebar from './sidebar'
import Conversation from './conversation'
import Typing from './typing'

import style from './style.scss'

import _ from 'lodash'

const api = route => '/api/botpress-hitl/' + route

export default class HitlModule extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      currentSession: null
    }
  }

  componentDidMount() {
    this.fetchAllSessions()
    .then(() => {
      if (!this.state.currentSession) {
        const firstSession = _.head(this.state.sessions.sessions)
        this.setSession(firstSession.id)
      }
    })
  }

  getAxios() {
    return this.props.bp.axios
  }

  fetchAllSessions() {
    this.setState({ loading: true })

    return this.getAxios().get('/api/botpress-hitl/sessions')
    .then((res) => {
      this.setState({
        loading: false,
        sessions: res.data
      })
    })
  }

  setSession(sessionId) {
    const session = _.find(this.state.sessions.sessions, { id: sessionId })
    this.setState({ currentSession: session })
  }

  sendMessage(message) {
    const sessionId = this.state.currentSession.id
    this.getAxios().post(`/api/botpress-hitl/sessions/${sessionId}/message`, { message })
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
              <Sidebar sessions={this.state.sessions} setSession={::this.setSession}/>
            </Col>
            <Col md={9} className={style.column}>
              <Row>
                <Col md={12}>
                  <Conversation bp={this.props.bp} data={this.state.currentSession}/>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Typing sendMessage={::this.sendMessage}/>
                </Col>
              </Row>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
