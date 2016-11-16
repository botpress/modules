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

const getEmptyBroadcast = () => {

  var isotimestamp = new Date().toISOString()
  var date = convertTimeStampToDate(timestamp)
  var time = convertTimeStampToTime(timestamp)
  var timestamp = convertTimeDateToTimeStamp(time, date)

  return {
    type: 'text',
    content: broadcastTypes['text'],
    date: date,
    time: time,
    timestamp: timestamp,
    progress: 0,
    userTimezone: true
  }
}

const convertTimeStampToTime = (timestamp) => {
  const hours = dateformat(timestamp, 'HH')
  const minutes = dateformat(timestamp, 'MM')
  const count = hours * 3600 + minutes * 60

  const stepCount = TIME_STEP * 60
  const roundedByStep = Math.round(count / stepCount) * stepCount

  return roundedByStep
}

const convertTimeToHoursMinuteSeconds = (time) => {
  return moment().startOf('day').add(time, 'seconds').format('HH:MM')
}

const convertTimeStampToDate = (timestamp) => {
  return moment(timestamp).format('YYYY-MM-DD')
}

const convertTimeDateToTimeStamp = (time, date) => {
  const hoursMinutesSeconds = convertTimeToHoursMinuteSeconds(time)
  const timezone = moment(new Date()).format('Z')
  return moment(date).format('YYYY-MM-DD') + ' ' + hoursMinutesSeconds + timezone
}

export default class BroadcastModule extends React.Component {

constructor(props){
    super(props)

    this.state = {
      loading: true,
      showModalForm: false,
      broadcast: {}
    }

    this.handleAddBroadcast = this.handleAddBroadcast.bind(this)
    this.handleModifyBroadcast = this.handleModifyBroadcast.bind(this)
    this.handleRemoveBroadcast = this.handleRemoveBroadcast.bind(this)
    this.handleOpenModalForm = this.handleOpenModalForm.bind(this)
    this.handleCloseModalForm = this.handleCloseModalForm.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handleContentChange = this.handleContentChange.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.handleUserTimezoneChange = this.handleUserTimezoneChange.bind(this)
  }

  getAxios() {
    return this.props.skin.axios
  }

  componentDidMount(){
    this.getAxios().get("/api/skin-broadcast/broadcasts")
    .then((res) => {
      this.setState({
        loading: false,
        broadcasts: res.data.broadcasts
      })
    });
  }

  handleAddBroadcast() {
    const newBroadcast = Object.assign({}, this.state.broadcast)
    newBroadcast.timestamp = convertTimeDateToTimeStamp(newBroadcast.time , newBroadcast.date)

    this.getAxios().post("/api/skin-broadcast/broadcasts", newBroadcast)
    .then(res => {
      let newBroadcasts = this.state.broadcasts
      newBroadcasts[res.data.id] = newBroadcast

      this.setState({
        broadcasts: newBroadcasts,
        loading: false,
        error: null,
        showModalForm: false
      })
    })
    .catch((err) => {
      this.setState({
        loading: false,
        error: err.res.data.message
      })
    })
  }

  handleModifyBroadcast() {
    const newBroadcast = Object.assign({}, this.state.broadcast)
    newBroadcast.timestamp = convertTimeDateToTimeStamp(newBroadcast.time , newBroadcast.date)

    this.getAxios().put("/api/skin-broadcast/broadcasts", {id: this.state.id, ...newBroadcast})
    .then(res => {
      var newBroadcasts = this.state.broadcasts
      newBroadcasts[this.state.id] = newBroadcast

      this.setState({
        broadcasts: newBroadcasts,
        loading: false,
        error: null,
        showModalForm: false
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
      broadcast = getEmptyBroadcast()
    }

    this.setState({
      modifyBroadcast: !id ? false : true,
      showModalForm: true,

      id: id,
      broadcast: {
        type: broadcast.type,
        content: broadcast.content,
        userTimezone: broadcast.userTimezone,
        date: broadcast.date,
        time: broadcast.time,
        timestamp: broadcast.timestamp,
        progress: broadcast.progress
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
    newBroadcast.date = value
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

  handleUserTimezoneChange() {
    var newBroadcast = this.state.broadcast
    newBroadcast.userTimezone = !newBroadcast.userTimezone
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
          <th>Progress</th>
          <th>Action</th>
        </tr>
      </thead>
    )
  }

  renderBroadcasts() {
    const getDateFormatted = (timestamp, userTimezone) => {
      return moment(new Date(timestamp).toISOString()).calendar()
    }

    return _.mapValues(this.state.broadcasts, (value, key) => {
      return (
        <tr key={key}>
          <td>{key}</td>
          <td>{getDateFormatted(value.timestamp, value.userTimezone)}</td>
          <td>{value.type}</td>
          <td>{value.content}</td>
          <td>{value.progress}</td>
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
    const getISODate = (date) => {
      if(date) {
        return new Date(date).toISOString()
      }
      return new Date().toISOString()
    }

    return (
      <FormGroup controlId="formDate">
        <Col componentClass={ControlLabel} sm={2}>
          Date
        </Col>
        <Col sm={10}>
        <DatePicker
          value={getISODate(this.state.broadcast.date)}
          onChange={this.handleDateChange}/>
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

  renderFormUserTimezone() {
    return (
      <FormGroup controlId="formUserTimezone">
        <Col componentClass={ControlLabel} sm={2}>
          User time zone
        </Col>
        <Col sm={10}>
          <Checkbox name='userTimezone' checked={this.state.broadcast.userTimezone}
            onChange={this.handleUserTimezoneChange} />
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
        {this.renderFormUserTimezone()}
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
