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
  FieldGroup,
  Button
} from 'react-bootstrap'

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

export default class ApiModule extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      message: null,
      initialStateHash: null
    }

    this.renderAccessToken = this.renderAccessToken.bind(this)
    this.renderLanguage = this.renderLanguage.bind(this)

    this.handleAccesTokenChange = this.handleAccesTokenChange.bind(this)
    this.handleSaveChanges = this.handleSaveChanges.bind(this)
    this.handleLanguageChange = this.handleLanguageChange.bind(this)
  }

  getStateHash() {
    return this.state.accessToken + ' ' + this.state.lang
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

  handleLanguageChange(event) {
    this.setState({
      lang: event.target.value
    })
  }

  handleSaveChanges() {
    this.setState({ loading:true })

    return this.getAxios().post('/api/botpress-wit/config', {
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
              </div>
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}
