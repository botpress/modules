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
      showCreate: false
    }
  }

  componentDidMount() {
    this.fetchAll()
    .then(() => {
      this.setState({ loading: false })
    })
  }

  fetchAll() {
    return this.fetchUpcoming()
  }

  fetchUpcoming() {
    return this.props.bp.axios.get(api('schedules/upcoming'))
    .then(({data}) => {
      this.setState({ upcoming: data })
    })
  }

  renderUpcoming() {
    if (this.state.upcoming.length === 0) {
      return <h3>There are no upcoming tasks</h3>
    }

    const elements = this.state.upcoming.map((el, i) => <Upcoming key={i} task={el}/>)
    return <ListGroup>
      {elements}
    </ListGroup>
  }

  renderLoading() {
    return <h1>Loading...</h1>
  }

  renderToolbar() {
    return <ButtonToolbar className={style.topbar}>
      <ButtonGroup>
        <Button>
          <span>Upcoming</span>
          <Badge>{this.state.upcoming.length}</Badge>
        </Button>
        <Button>
          <span>Previous</span>
          <Badge>{this.state.previous.length}</Badge>
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
          <Row className={style['row-centered']}>
            <Col sm={12} md={8} lg={4} className={style['col-centered']}>
              {this.renderUpcoming()}
            </Col>
          </Row>
        </Grid>
        <CreateModal ref={r => this.createModal = r} axios={this.props.bp.axios}/>
      </div>
    )
  }
}
