import React from 'react'
import ReactDOM from 'react-dom'

import {
  Nav,
  NavItem,
  Navbar,
  Button,
  Glyphicon,
  Panel,
  Table,
  Modal,
  Popover,
  Tooltip,
  OverlayTrigger,
  Form,
  FormGroup,
  FormControl,
  Checkbox,
  Col,
  Row,
  ControlLabel
} from 'react-bootstrap'

import DatePicker from 'react-bootstrap-date-picker'
import TimePicker from 'react-bootstrap-time-picker'
import moment from 'moment'
import dateformat from 'dateformat'

import _ from 'lodash'

import style from './style.scss'

const TIME_STEP = 30

const broadcastTypes = {
  text: 'Text content here',
  javascript: 'JS function',
  facebook: 'Facebook specific content'
}

const getTimeFromTimeStamp = (timestamp) => {
  const hours = dateformat(timestamp, 'h')
  const minutes = dateformat(timestamp, 'MM')
  const count = hours * 3600 + minutes * 60

  const stepCount = TIME_STEP * 60
  const roundedByStep = Math.round(count / stepCount) * stepCount

  return roundedByStep
}

const getDateFromTimeStamp = (timestamp) => {
  return dateformat(timestamp, "yyyy-mm-d")
}

export default class BroadcastModule extends React.Component {

constructor(props){
    super(props)

    var date = new Date().toISOString()
    this.state = {
      loading: true,
      showModalForm: false,
      broadcast: {},
      broadcasts: {
        1 : {
          type: 'text',
          timestamp: date,
          userTimeZone: true
        },
        2 : {
          type: 'javascript',
          timestamp:  date,
          userTimeZone: false
        }
      }
    }

    this.updateBroadcasts = this.updateBroadcasts.bind(this)
    this.handleAddBroadcast = this.handleAddBroadcast.bind(this)
    this.handleRemoveBroadcast = this.handleRemoveBroadcast.bind(this)
    this.handleOpenModalForm = this.handleOpenModalForm.bind(this)
    this.handleCloseModalForm = this.handleCloseModalForm.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handleContentChange = this.handleContentChange.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.handleUserTimeZoneChange = this.handleUserTimeZoneChange.bind(this)
  }

  getAxios() {
    return this.props.skin.axios
  }

  componentDidMount(){
    //updateBroadcasts()
  }

  updateBroadcasts() {
    this.getAxios().get("/api/skin-broadcast/broadcasts")
    .then((res) => {
      this.setState({
        broadcasts: res.data.broadcasts
      })
    })
  }

  handleAddBroadcast() {
    console.log(this.state.broadcast)

    var newBroadcasts = this.state.broadcasts
    newBroadcasts[333] = broadcast

    this.setState({
      broadcasts: newBroadcasts,
      loading: false,
      error: null
    })

    // this.getAxios().post("/api/skin-broadcast/broadcasts", broadcast)
    // .then(res => {
    //   var newBroadcasts = this.state.broadcasts
    //   newBroadcasts[333] = broadcast
    //
    //   this.setState({
    //     broadcasts: newBroadcasts,
    //     loading: false,
    //     error: null
    //   })
    // })
    // .catch((err) => {
    //   this.setState({
    //     loading: false,
    //     error: err.response.data.message
    //   })
    // })
  }

  handleModifyBroadcast() {
    this.getAxios().update("/api/skin-broadcast/broadcasts/" + id, broadcast)
    .then(res => {
      var newBroadcasts = this.state.broadcast
      newBroadcasts[id] = broadcast

      this.setState({
        broadcasts: newBroadcasts,
        loading: false,
        error: null
      })
    })
    .catch((err) => {
      this.setState({
        loading: false,
        error: err.response.data.message
      })
    })
  }

  handleRemoveBroadcast(id) {
    this.getAxios().delete("/api/skin-broadcast/broadcasts/" + id)
    .then(res => {
      this.setState({
        broadcasts: _.omit(this.state.broadcasts, [id]),
        loading: false,
        error: null
      })
    })
    .catch((err) => {
      this.setState({
        loading: false,
        error: err.response.data.message
      })
    })
  }

  handleCloseModalForm() {
    this.setState({ showModalForm: false })
  }

  handleOpenModalForm(broadcast, id) {
    if(!id) {
      id = null
    }

    if(!broadcast) {
      broadcast = {
        type: 'text',
        content: broadcastTypes['text'],
        timestamp:  new Date().toISOString(),
        userTimeZone: true
      }
    }

    var convertedTime = getTimeFromTimeStamp(broadcast.timestamp)
    var convertedDate = getDateFromTimeStamp(broadcast.timestamp)

    this.setState({
      modifyBroadcast: !id ? false : true,
      showModalForm: true,

      id: id,
      broadcast: {
        type: broadcast.type,
        content: broadcast.content,
        timestamp: broadcast.timestamp,
        userTimeZone: broadcast.userTimeZone,
        date: convertedDate,
        time: convertedTime
      }
    })
  }

  handleSelectChange(event) {
    var newBroadcast = this.state.broadcast
    newBroadcast.type = event.target.value
    this.setState({
      broadcast: newBroadcast
    })
  }

  handleContentChange(event) {
    var newBroadcast = this.state.broadcast
    newBroadcast.content = event.target.value
    this.setState({
      broadcast: newBroadcast
    })
  }

  handleDateChange(value) {
    var newBroadcast = this.state.broadcast
    newBroadcast.date = getDateFromTimeStamp(value)

    this.setState({
      broadcast: newBroadcast
    })
  }

  handleTimeChange(value) {
    var newBroadcast = this.state.broadcast
    newBroadcast.time = value

    this.setState({
      broadcast: newBroadcast
    });
  }

  handleUserTimeZoneChange() {
    var newBroadcast = this.state.broadcast
    newBroadcast.userTimeZone = !newBroadcast.userTimeZone
    this.setState({
      broadcast: newBroadcast
    })
  }

  renderTableHeader() {
    return (
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Type</th>
          <th>Content</th>
          <th>Send</th>
          <th>Action</th>
        </tr>
      </thead>
    )
  }

  renderBroadcasts() {
    return _.mapValues(this.state.broadcasts, (value, key) => {
      return (
        <tr key={key}>
          <td>{key}</td>
          <td>{moment().calendar(value.timestamp)}</td>
          <td>{value.type}</td>
          <td>{value.content}</td>
          <td>{value.send}</td>
          <td>
            <Button onClick={() => this.handleOpenModalForm(value, key)}>
              <Glyphicon glyph='file' />
            </Button>
            <Button onClick={() => this.handleOpenModalForm(value)}>
              <Glyphicon glyph='copy' />
            </Button>
            <Button onClick={() => this.handleRemoveBroadcast(key)}>
              <Glyphicon glyph='trash' />
            </Button>
          </td>
        </tr>
      )
    })
  }

  renderTableBody() {
    return (
      <tbody>
        {_.values(this.renderBroadcasts())}
      </tbody>
    )
  }

  renderPlannedBroadcastTable() {
    return (
      <Table striped bordered condensed hover>
        {this.renderTableHeader()}
        {this.renderTableBody()}
      </Table>
    )
  }

  renderTypeList() {
    return _.mapValues(broadcastTypes, (value, key) => {
      return <option key={key} value={key}>{key}</option>
    })
  }

  renderFormType() {
    return (
      <FormGroup controlId="formType">
        <Col componentClass={ControlLabel} sm={2}>
          Type
        </Col>
        <Col sm={10}>
          <FormControl componentClass="select" onChange={this.handleSelectChange} value={this.state.broadcast.type}>
            {_.values(this.renderTypeList())}
          </FormControl>
        </Col>
      </FormGroup>
    )
  }

  renderFormContent() {
    return (
      <FormGroup controlId="formContent">
        <Col componentClass={ControlLabel} sm={2}>
          Content
        </Col>
        <Col sm={10}>
          <FormControl componentClass="textarea"
            value={this.state.broadcast.content}
            onChange={this.handleContentChange}
            placeholder={broadcastTypes[this.state.broadcast.type]}/>
        </Col>
      </FormGroup>
    )
  }

  renderFormDate() {
    return (
      <FormGroup controlId="formDate">
        <Col componentClass={ControlLabel} sm={2}>
          Date
        </Col>
        <Col sm={10}>
        <DatePicker value={this.state.broadcast.date} onChange={this.handleDateChange}/>
        </Col>
      </FormGroup>
    )
  }

  renderFormTime() {
    return (
      <FormGroup controlId="formTime">
        <Col componentClass={ControlLabel} sm={2}>
          Time
        </Col>
        <Col sm={10}>
          <TimePicker step={30} onChange={this.handleTimeChange} value={this.state.broadcast.time}/>
        </Col>
      </FormGroup>
    )
  }

  renderFormUserTimeZone() {
    return (
      <FormGroup controlId="formUserTimeZone">
        <Col componentClass={ControlLabel} sm={2}>
          User time zone
        </Col>
        <Col sm={10}>
          <Checkbox name='userTimeZone' checked={this.state.broadcast.userTimeZone}
            onChange={this.handleUserTimeZoneChange} />
        </Col>
      </FormGroup>
    )
  }

  renderForm() {
    return (
      <Form horizontal>
        {this.renderFormType()}
        {this.renderFormContent()}
        {this.renderFormDate()}
        {this.renderFormTime()}
        {this.renderFormUserTimeZone()}
      </Form>
    )
  }

  renderActionButton() {
    const onClickAction = this.state.modifyBroadcast ? this.handleModifyBroadcast : this.handleAddBroadcast
    const buttonName = this.state.modifyBroadcast ? 'Modify' : 'Create'

    return <Button action='' onClick={onClickAction}>{buttonName}</Button>
  }

  renderModalForm () {
    return (
      <Modal show={this.state.showModalForm} onHide={this.handleCloseModalForm}>
        <Modal.Header closeButton>
          <Modal.Title>{this.state.modifyBroadcast ? 'Modify broadcast...' : 'Create new broadcast...'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderForm()}
          </Modal.Body>
        <Modal.Footer>
          {this.renderActionButton()}
          <Button onClick={this.handleCloseModalForm}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  renderNavBar() {
    return (
      <Navbar fluid collapseOnSelect className={style.navbar}>
        <Navbar.Header>
          <Navbar.Brand>
            Planned broadcast
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <NavItem>
              <Button onClick={() => this.handleOpenModalForm()}>
                <Glyphicon glyph='plus'></Glyphicon>
              </Button>
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }

  render() {
    return (
      <div>
        {this.renderNavBar()}
        <Panel className={style.mainPanel}>
          {this.renderPlannedBroadcastTable()}
        </Panel>
        {this.renderModalForm()}
      </div>
    )
  }
}
