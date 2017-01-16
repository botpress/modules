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
      currentSession: null,
      sessions: null
    }

    this.updateSession = ::this.updateSession
    this.refreshSessions = ::this.refreshSessions
  }

  componentDidMount() {
    this.props.bp.events.on('hitl.message', this.updateSession)
    this.props.bp.events.on('hitl.session', this.refreshSessions)
    this.refreshSessions()
  }

  componentWillUnmount() {
    this.props.bp.events.off('hitl.message', this.updateSession)
    this.props.bp.events.off('hitl.session', this.refreshSessions)
  }

  refreshSessions(session) {
    this.fetchAllSessions()
    .then(() => {
      if (!this.state.currentSession) {
        const firstSession = _.head(this.state.sessions.sessions)
        this.setSession(firstSession.id)
      }
    })
  }

  updateSession(message) {
    if (!this.state.sessions) {
      return
    }

    const session = _.find(this.state.sessions.sessions, { id: message.session_id })

    if (!session) {
      return
    }

    const newSession = Object.assign({}, session, { 
      text: message.text,
      direction: message.direction,
      type: message.type,
      last_event_on: parseInt(message.ts),
      last_heard_on: message.direction === 'in' ? parseInt(message.ts) : session.last_heard_on
    })

    const newSessions = {
      total: this.state.sessions.total,
      sessions: [newSession, ..._.without(this.state.sessions.sessions, session)]
    }

    this.setState({ sessions:  newSessions })
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

    const currentSessionId = this.state.currentSession && this.state.currentSession.id
    return (
      <div className={style.mainContainer}>
        <Grid>
          <Row>
            <Col md={3} className={style.column}>
              <Sidebar sessions={this.state.sessions} setSession={::this.setSession} currentSession={currentSessionId}/>
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
