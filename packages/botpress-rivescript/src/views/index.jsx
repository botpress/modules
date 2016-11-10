import React from 'react'
import ReactDOM from 'react-dom'

import { Tabs, Tab, Col, Row, Grid, Form, FormGroup, Button, FormControl } from 'react-bootstrap'

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
    const { axios } = this.props.skin

    axios.get('/api/skin-rivescript/scripts')
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
      const { axios } = this.props.skin
      this.setState({ discussion: '' })
      axios.post('/api/skin-rivescript/reset')
    }

    this.setState({ simulationOn: !this.state.simulationOn })
  }

  createNewFile() {
    const name = prompt('Name of the script', 'Enter the name of the script')

    this.setState({
      selected: name,
      files: { ...this.state.files, [name]: '' }
    })
  }

  deleteScript() {
    const { axios } = this.props.skin

    const response = confirm("Are you sure you want to delete this script (" + 
      this.state.selected + ")? This can't be undone.")

    if(response === true) {
      axios.delete('/api/skin-rivescript/scripts/' + this.state.selected)
      .then(() => {
        const newFiles = _.omit(this.state.files, this.state.selected)
        const newSelected = _.first(_.keys(newFiles))
        this.setState({ files: newFiles, selected: newSelected })
      })
    }
  }

  saveCurrentFile() {
    const { axios } = this.props.skin

    const data = { 
      name: this.state.selected, 
      content: this.state.files[this.state.selected],
      overwrite: true
    }

    axios.post('/api/skin-rivescript/scripts', data)
    .then(() => {
      this.resetDirtyForOne(this.state.selected)
    })
  }


  sendText(event) {
    const { axios } = this.props.skin
    const text = this.state.textInput

    const youSent = 'You> ' + text
    this.setState({ discussion: this.state.discussion + '\n' + youSent })

    axios.post('/api/skin-rivescript/simulate', { text })
    .then(({ data }) => {
      const botSent = 'Bot> ' + data
      this.setState({ discussion: this.state.discussion + '\n' + botSent })
    })

    this.setState({ textInput: '' })
    event.preventDefault()
  }

  onInputChanged(event) {
    this.setState({ textInput: event.target.value })
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
      options={{ lineNumbers: true }} />

    const onSelect = (key) => this.setState({ selected: key })

    const editors = _.values(_.mapValues(this.state.files, function (value, key) {
      return <Tab key={key} eventKey={key} title={key}></Tab>
    }))

    const tabsInstance = (
      <Tabs id="fileSelection" className={style.tabs} onSelect={onSelect}>
        {editors}
      </Tabs>
    )

    const saveClass = classnames({
      [style.dirty]: this.isDirty(this.state.selected)
    })

    const simOn = this.state.simulationOn

    return <Grid fluid>
      <Row>
        <Button onClick={this.toggleSimulation.bind(this)}>{this.state.simulationOn ? 'Stop' : 'Play'}</Button>
        <Button onClick={this.saveCurrentFile.bind(this)} className={saveClass}>Save</Button>
        <Button onClick={this.createNewFile.bind(this)}>New...</Button>
        <Button onClick={this.deleteScript.bind(this)}>Delete...</Button>
      </Row>
      <Row>
        <Col md={12} lg={8}>
          {tabsInstance}
          {editor}
        </Col>
        <Col md={12} lg={4}>
          <FormControl readOnly componentClass="textarea" value={this.state.discussion} className={style.discussion} />
            <Form inline action='' onSubmit={this.sendText.bind(this)}>
              <FormGroup>
                <FormControl disabled={!simOn} placeholder="Speak here" value={this.state.textInput} onChange={this.onInputChanged.bind(this)} />
              </FormGroup>
              <Button disabled={!simOn} onClick={this.sendText.bind(this)}>Send</Button>
            </Form>
        </Col>
      </Row>
      
    </Grid>
  }
}
