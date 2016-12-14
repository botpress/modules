import React from 'react'
import {
  Grid,
  Row,
  Col,
  ListGroup,
  ButtonToolbar,
  ButtonGroup,
  Button,
  Badge
} from 'react-bootstrap'

import classnames from 'classnames'

import Previous from './previous'
import Upcoming from './upcoming'
import CreateModal from './create'

import style from './style.scss'

const api = route => '/api/botpress-scheduler/' + route

export default class SchedulerModule extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      upcoming: [],
      previous: [],
      showCreate: false,
      active: 'Upcoming'
    }
  }

  componentDidMount() {
    this.fetchAll()
    .then(() => {
      this.setState({ loading: false })
    })

    this.props.bp.events.on('scheduler.update', ::this.fetchAll)
  }

  componentWillUnmount() {
    this.props.bp.events.off('scheduler.update', ::this.fetchAll)
  }

  fetchAll() {
    return this.fetchUpcoming()
    .then(() => this.fetchPrevious())
  }

  fetchUpcoming() {
    return this.props.bp.axios.get(api('schedules/upcoming'))
    .then(({data}) => {
      this.setState({ upcoming: data })
    })
  }

  fetchPrevious() {
    return this.props.bp.axios.get(api('schedules/past'))
    .then(({data}) => {
      this.setState({ previous: data })
    })
  }

  setActive(view) {
    return () => this.setState({ active: view })
  }

  trashAllDone() {
    this.props.bp.axios.delete(api('done'))
  }

  renderUpcoming() {
    if (this.state.upcoming.length === 0) {
      return <h3>There are no upcoming tasks</h3>
    }
    const axios = this.props.bp.axios
    const elements = this.state.upcoming.map((el, i) => <Upcoming key={i} task={el} axios={axios}/>)
    return <Col sm={12} md={8} lg={6} className={style['col-centered']}>
      <ListGroup>
        {elements}
      </ListGroup>
    </Col>
  }

  renderPrevious() {
    if (this.state.previous.length === 0) {
      return <h3>There are no previously run tasks</h3>
    }

    const trashAll = <h4 className={style.trashAll}>
      <a href="#" onClick={::this.trashAllDone}>Trash all</a>
      {' done'}
    </h4>

    const elements = this.state.previous.map((el, i) => <Previous key={i} task={el}/>)
    return <Col sm={12} md={8} lg={8} className={style['col-centered']}>
      {trashAll}
      <ListGroup>
        {elements}
      </ListGroup>
    </Col>
  }

  renderLoading() {
    return <h1>Loading...</h1>
  }

  renderToolbar() {
    return <ButtonToolbar className={style.topbar}>
      <ButtonGroup>
        <Button active={this.state.active === 'Upcoming'} onClick={this.setActive('Upcoming')}>
          <span>Upcoming</span>
          <Badge><p>{this.state.upcoming.length}</p></Badge>
        </Button>
        <Button active={this.state.active === 'Previous'} onClick={this.setActive('Previous')}>
          <span>Previous</span>
          <Badge><p>{this.state.previous.length}</p></Badge>
        </Button>
      </ButtonGroup>
    </ButtonToolbar>
  }

  renderCreateButton() {

    const click = () => this.createModal.show()

    return <div className="pull-right">
      <Button bsStyle="primary" onClick={click}>Create</Button>
    </div>
  }

  render() {

    if (this.state.loading) {
      return this.renderLoading()
    }

    return (
      <div>
        <Grid>
          <Row>
            <Col sm={12}>{this.renderCreateButton()}</Col>
          </Row>
          <Row className={style['row-centered']}>
            <Col sm={12} md={8} lg={4} className={style['col-centered']}>
              {this.renderToolbar()}
            </Col>
          </Row>
          <Row className={classnames(style['row-centered'], style.tasks)}>
            {this.state.active === 'Upcoming' ? this.renderUpcoming() : this.renderPrevious()}
          </Row>
        </Grid>
        <CreateModal ref={r => this.createModal = r} axios={this.props.bp.axios}/>
      </div>
    )
  }
}
