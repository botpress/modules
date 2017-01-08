import React from 'react'

import {
  Form,
  FormGroup,
  FormControl,
  Col,
  Button,
  ControlLabel,
  // Panel,
  // Checkbox,
  // Glyphicon,
  // ListGroup,
  // ListGroupItem,
  // InputGroup,
  // Alert
} from 'react-bootstrap'

import style from './style.scss'

export default class SlackModule extends React.Component {

  state = {
    message: '',
    slackApiToken: ''
  }

  // TODO handle error
  // TODO add eslint about missing class method

  getAxios = () => this.props.bp.axios
  mApi = (method, url, body) => this.getAxios()[method]('/api/botpress-slack' + url, body)
  mApiGet = (url, body) => this.mApi('get', url, body)
  mApiPost = (url, body) => this.mApi('post', url, body)

  fetchConfigs = () => {
    this.mApiGet('/configs').then(({data}) => {
      this.setState({
        slackApiToken: data.slackApiToken
      })
    })
  }

  // ----- component lifecycles -----

  componentDidMount() {
    this.fetchConfigs()
  }

  // ----- event handle functions -----
  handleChange = event => {
    var { name, value } = event.target

    this.setState({
      [name]: value
    })
  }

  handleSaveConfig = () => {
    this.mApiPost('/configs', {
      slackApiToken: this.state.slackApiToken
    })
    // TODO handle error and response
  }

  handleSendTestMessage = () => {
    const { message } = this.state

    // TODO handle error
    this.mApiPost('/sendMessage', { message })
      .then(() => {
        this.setState({ message: '' })
      })
  }

  // ----- render functions -----

  renderHeader = title => (
    <div className={style.header}>
      <h4>{title}</h4>
    </div>
  )

  renderLabel = label => {
    return (
      <Col componentClass={ControlLabel} sm={3}>
        {label}
      </Col>
    )
  }

  renderInput = (label, name, props = {}) => (
    <FormGroup>
      {this.renderLabel(label)}
      <Col sm={7}>
        <FormControl name={name} {...props}
          value={this.state[name]}
          onChange={this.handleChange} />
      </Col>
    </FormGroup>
  )

  renderTextInput = (label, name, props = {}) => this.renderInput(label, name, {
    type: 'text', ...props
  })

  renderTextAreaInput = (label, name, props = {}) => this.renderInput(label, name, {
    componentClass: 'textarea',
    rows: 3,
    ...props
  })

  withNoLabel = (element) => (
    <FormGroup>
      <Col smOffset={3} sm={7}>
        {element}
      </Col>
    </FormGroup>
  )

  renderBtn = (label, handler) => (
    <Button className={style.formButton} onClick={handler}>
      {label}
    </Button>
  )

  renderConfigSection = () => (
    <div className={style.section}>
      {this.renderHeader('Config')}
      {this.renderTextAreaInput('Slack Token', 'slackApiToken', {
        placeholder: 'paste slack api token here'
      })}

      {this.withNoLabel(
        this.renderBtn('Save', this.handleSaveConfig)
      )}
    </div>
  )

  renderTestSection = () => (
    <div className={style.section}>
      {this.renderHeader('Test Area')}
      {this.renderTextAreaInput('Message', 'message', {
        placeholder: 'type test message here'
      })}

      {this.withNoLabel(
        <Button className={style.formButton} onClick={this.handleSendTestMessage}>
          Send
        </Button>
      )}
    </div>
  )

  render() {
    return <Form horizontal>
      {this.renderConfigSection()}
      {this.renderTestSection()}
    </Form>
  }
}
