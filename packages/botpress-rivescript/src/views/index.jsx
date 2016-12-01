import React from 'react'
import ReactDOM from 'react-dom'

import {
  Tabs,
  Tab,
  Col,
  Row,
  Grid,
  Form,
  FormGroup,
  Button,
  FormControl,
  ControlLabel,
  Panel,
  Navbar,
  Nav,
  NavItem,
  Glyphicon,
  InputGroup
 } from 'react-bootstrap'

import _ from 'lodash'

import md5 from 'md5'

import Codemirror from 'react-codemirror'
import classnames from 'classnames'

require('codemirror/lib/codemirror.css')

import style from './style.scss'

export default class RiveScriptModule extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      discussion: '',
      textInput: '',
      selected: null,
      files: null,
      simulationOn: false,
      dirty: {}
    }
  }

  componentDidMount() {
    this.isUnmounting = false
    const { axios } = this.props.bp

    axios.get('/api/botpress-rivescript/scripts')
    .then(({ data }) => {
      if(this.isUnmounting) {
        return
      }
      this.setState({ files: data, selected: _.keys(data)[0] })
      this.resetDirty(data)
    })
  }

  componentWillUnmount() {
    this.isUnmounting = true
  }

  resetDirty(files) {
    const dirty = {}
    for(var name of _.keys(files || this.state.files)) {
      const hash = md5(this.state.files[name])
      dirty[name] = hash
    }
    this.setState({ dirty })
  }

  resetDirtyForOne(name) {
    this.setState({
      dirty: { ...this.state.dirty, [name]: md5(this.state.files[name]) }
    })
  }

  isDirty(name) {
    return md5(this.state.files[name]) !== this.state.dirty[name]
  }

  updateCode(newCode) {
    this.setState({ code: newCode })
  }

  toggleSimulation() {
    if(this.state.simulationOn) {
      const { axios } = this.props.bp
      this.setState({ discussion: '' })
      axios.post('/api/botpress-rivescript/reset')
    }
    if(!this.state.simulationOn) {
      setTimeout(() => ReactDOM.findDOMNode(this.sendMessage).focus(), 300)
    }

    this.setState({ simulationOn: !this.state.simulationOn })
  }

  createNewFile() {
    const name = prompt('Name of the script', 'name')

    this.setState({
      selected: name,
      files: { ...this.state.files, [name]: '' }
    })

    setTimeout(this.saveCurrentFile.bind(this), 500)
  }

  deleteScript() {
    const { axios } = this.props.bp

    const response = confirm("Are you sure you want to delete this script (" +
      this.state.selected + ")? This can't be undone.")

    if(response === true) {
      axios.delete('/api/botpress-rivescript/scripts/' + this.state.selected)
      .then(() => {
        const newFiles = _.omit(this.state.files, this.state.selected)
        const newSelected = _.first(_.keys(newFiles))
        this.setState({ files: newFiles, selected: newSelected })
      })
    }
  }

  saveCurrentFile() {
    const { axios } = this.props.bp

    const data = {
      name: this.state.selected,
      content: this.state.files[this.state.selected],
      overwrite: true
    }

    axios.post('/api/botpress-rivescript/scripts', data)
    .then(() => {
      this.resetDirtyForOne(this.state.selected)
    })
  }


  sendText(event) {
    const { axios } = this.props.bp
    const text = this.state.textInput

    const youSent = 'You > ' + text
    this.setState({ discussion: this.state.discussion + '\n' + youSent })

    axios.post('/api/botpress-rivescript/simulate', { text })
    .then(({ data }) => {
      const botSent = 'Bot > ' + data
      this.setState({ discussion: this.state.discussion + '\n' + botSent })
    })

    this.setState({ textInput: '' })
    event.preventDefault()
  }

  onInputChanged(event) {
    this.setState({ textInput: event.target.value })
  }

  renderHeader() {

    const saveClass = classnames({
      [style.dirty]: this.isDirty(this.state.selected)
    })

    const className = classnames('pull-right', style.header)

    return <Row className={style.headerRow}>
      <Col className={className}>
        <Button onClick={this.toggleSimulation.bind(this)}>
          {this.state.simulationOn ? <Glyphicon glyph='stop'></Glyphicon> : <Glyphicon glyph='play'></Glyphicon> }
        </Button>
        <Button onClick={this.saveCurrentFile.bind(this)} className={saveClass}>
          <Glyphicon glyph='floppy-disk'></Glyphicon>
        </Button>
        <Button onClick={this.createNewFile.bind(this)}>
          <Glyphicon glyph='file'></Glyphicon>
        </Button>
        <Button onClick={this.deleteScript.bind(this)}>
          <Glyphicon glyph='trash'></Glyphicon>
        </Button>
      </Col>
    </Row>
  }

  render() {

    if(!this.state.files) {
      return <h1>Loading...</h1>
    }

    const { selected } = this.state
    const onChange = (code) => this.setState({ files: { ...this.state.files, [selected]: code } })

    const editor = <Codemirror
      value={this.state.files[selected]}
      onChange={onChange}
      options={{ lineNumbers: true, readOnly: this.state.simulationOn }} />

    const onSelect = (key) => this.setState({ selected: key })

    const editors = _.values(_.mapValues(this.state.files, function (value, key) {
      if(selected === key){
        return <NavItem className={style.fileInFolder} key={key} eventKey={key} active>{key}</NavItem>
      }
      return <NavItem className={style.fileInFolder} key={key} eventKey={key}>{key}</NavItem>
    }))

    const tabsInstance = (
      <Tab.Container id='listOfFiles' className={style.fileSelection}>
        <Nav onSelect={onSelect.bind(this)} stacked>
          <NavItem key='folder' disabled>
            <Glyphicon glyph='folder-open'></Glyphicon>
            <span className={style.folderText}>rivescript</span>
          </NavItem>
          {editors}
        </Nav>
      </Tab.Container>
    )

    const simulationClass = classnames({
      [style.discussion]: true,
      [style.simulationRunning]: this.state.simulationOn
    })

    const simOn = this.state.simulationOn

    return <Grid fluid>
      
      <Row>
        <Panel>
          {this.renderHeader()}
        </Panel>
      </Row>

      <Row >
        <Col sm={3} md={3} lg={2} className={style.filesColumn}>
          {tabsInstance}
        </Col>
        <Col sm={9} md={9} lg={7} className={style.codeColumn}>
          {editor}
        </Col>
        <Col sm={12} md={12} lg={3} className={style.simulationColumn}>
          <FormControl readOnly componentClass="textarea" value={this.state.discussion} className={simulationClass} />
          <Form action='' onSubmit={this.sendText.bind(this)}>
            <FormGroup>
              <InputGroup>
                <FormControl ref={i => this.sendMessage = i} className={style.sendText} disabled={!simOn}
                  placeholder="Speak here" value={this.state.textInput} onChange={this.onInputChanged.bind(this)} />
              </InputGroup>
            </FormGroup>
          </Form>
        </Col>
      </Row>
    </Grid>
  }
}
