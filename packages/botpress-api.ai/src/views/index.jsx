import React from 'react'
import _ from 'lodash'

import {
  Panel,
  Grid,
  Row,
  Col,
  ControlLabel,
  FormGroup,
  FormControl,
  Alert,
  Button
} from 'react-bootstrap'

import Markdown from 'react-markdown'
import style from './style.scss'

const supportedLanguages = {
  'pt-BR': "Brazilian Portuguese",
  'zh-HK': "Chinese (Cantonese)",
  'zh-CN': "Chinese (Simplified)",
  'zh-TW': "Chinese (Traditional)",
  'en': "English",
  'nl': "Dutch",
  'fr': "French",
  'de': "German",
  'it': "Italian",
  'ja': "Japanese",
  'ko': "Korean",
  'pt': "Portuguese",
  'ru': "Russian",
  'es': "Spanish",
  'uk': "Ukrainian"
}

const documentation = {
  default: `
  ### Default

  This mode will inject understanding metadata inside incoming messages through the Wit.ai middleware.

  Events will have a \`wit\` property populated with the extracted \`entities\` and the \`context\`.

  **Tip:** Use this mode if you want to handle the conversation flow yourself and only want to extract entities from incoming text. This is great for programmers.

  \`\`\`js
  bp.hear({'wit.entities.intent[0].value': 'weather'}, (event, next) => {
    console.log('>> Weather')
    bp.messenger.sendText(event.user.id, 'Weather intent')
  })
  \`\`\`
  `
  ,
  fulfillment: `### Fulfillment

  This mode will run your Wit.ai stories automatically given that you defined the **Actions** in botpress.

  For more information about Actions and how they are run, make sure to read [node-wit](https://github.com/wit-ai/node-wit)'s documentation.

  **Tip:** Use this mode if you created a conversation flow on Wit.ai's User Interface and want it to run automatically in your bot. This is great for non-programmers.

  #### Example

  \`\`\`js
  // Implement your Actions like this
  bp.wit.actions['getWeather'] = request => {
    return new Promise((resolve, reject) => {
      bp.logger.info('Get Weather called', request)
      // Do something here
      resolve(request.context)
    })
  }

  // You need to call this method once you are done implementing the Actions
  bp.wit.reinitializeClient()
  \`\`\`
  `
}

export default class ApiModule extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      message: null,
      initialStateHash: null
    }

    this.renderAccessToken = this.renderAccessToken.bind(this)
    this.renderRadioButton = this.renderRadioButton.bind(this)
    this.renderLanguage = this.renderLanguage.bind(this)

    this.handleAccesTokenChange = this.handleAccesTokenChange.bind(this)
    this.handleSaveChanges = this.handleSaveChanges.bind(this)
    this.handleRadioChange = this.handleRadioChange.bind(this)
    this.handleLanguageChange = this.handleLanguageChange.bind(this)
  }

  getStateHash() {
    return this.state.accessToken + ' ' + this.state.lang + ' ' + this.state.mode
  }

  getAxios() {
    return this.props.bp.axios
  }

  componentDidMount() {
    this.getAxios().get('/api/botpress-apiai/config')
    .then((res) => {
      this.setState({
        loading: false,
        ...res.data
      })

      setImmediate(() => {
        this.setState({
          initialStateHash: this.getStateHash()
        })
      })
    })
  }

  handleAccesTokenChange(event) {
    this.setState({
      accessToken: event.target.value
    })
  }

  handleRadioChange(event) {
    this.setState({
      selectedMode: event.target.value
    })
  }

  handleLanguageChange(event) {
    this.setState({
      lang: event.target.value
    })
  }

  handleSaveChanges() {
    this.setState({ loading:true })

    return this.getAxios().post('/api/botpress-apiai/config', {
      accessToken: this.state.accessToken,
      lang: this.state.lang
    })
    .then(() => {
      this.setState({
        loading: false,
        initialStateHash: this.getStateHash()
      })
    })
    .catch((err) => {
      this.setState({
        message: {
          type: 'danger',
          text: 'An error occured during you were trying to save configuration: ' + err.response.data.message
        },
        loading: false,
        initialStateHash: this.getStateHash()
      })
    })
  }

  renderAccessToken() {
    return (
      <Row>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Access Token
          </Col>
          <Col sm={8}>
            <FormControl type="text" value={this.state.accessToken} onChange={this.handleAccesTokenChange}/>
          </Col>
        </FormGroup>
      </Row>
    )
  }

  renderRadioButton(label, key, props) {
    return (
      <span className={style.radio} key={key}>
        <label>
          <input type="radio" value={key}
            checked={this.state.mode === key}
            onChange={this.handleRadioChange} />

          <span className={style.radioText}>{label}</span>
        </label>
      </span>
    )
  }

  renderMode() {
    return (
      <Row>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Mode
          </Col>
          <Col sm={8}>
            {this.renderRadioButton('Default', 'default')}
            {this.renderRadioButton('Fulfillment', 'fulfillment')}
          </Col>
        </FormGroup>
      </Row>
    )
  }

  renderLanguageOption(value, key) {
    return <option key={key} value={key}>{value}</option>
  }

  renderLanguage() {
    const supportedLanguageOptions = _.mapValues(supportedLanguages, this.renderLanguageOption)

    return (
      <Row>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Language
          </Col>
          <Col sm={8}>
            <FormControl value={this.state.lang} componentClass="select" onChange={this.handleLanguageChange}>
              {_.map(supportedLanguageOptions)}
            </FormControl>
          </Col>
        </FormGroup>
      </Row>
    )
  }

  renderExplication() {
    return (
      <Row className={style.explication}>
        <Col sm={12}>
          <Markdown source={documentation[this.state.selectedMode]} />
        </Col>
      </Row>
    )
  }

  renderMessageAlert() {
    return this.state.message
      ? <Alert bsStyle={this.state.message.type}>{this.state.message.text}</Alert>
      : null
  }

  renderSaveButton() {
    const opacityStyle = (this.state.initialStateHash && this.state.initialStateHash !== this.getStateHash())
      ? {opacity:1}
      : {opacity:0}

    return <Button style={opacityStyle} bsStyle="success" onClick={this.handleSaveChanges}>Save</Button>
  }

  render() {
    if (this.state.loading) {
      return <h4>Module is loading...</h4>
    }

    return (
      <Grid className={style.api}>
        <Row>
          <Col md={8} mdOffset={2}>
            {this.renderMessageAlert()}
            <Panel className={style.panel} header="Settings">
              {this.renderSaveButton()}
              <div className={style.settings}>
                {this.renderAccessToken()}
                {this.renderLanguage()}
                {this.renderMode()}
              </div>
            </Panel>
            <Panel header="Documentation">
              {this.renderExplication()}
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}
