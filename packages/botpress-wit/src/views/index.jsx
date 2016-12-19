import React from 'react'
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

export default class TemplateModule extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      message: null,
      initialStateHash: null,
      modes: {
        understanding: 'Understanding mode is...',
        stories: 'Stories mode is...'
      }
    }

    this.renderAccessToken = this.renderAccessToken.bind(this)
    this.renderRadioButton = this.renderRadioButton.bind(this)

    this.handleAccesTokenChange = this.handleAccesTokenChange.bind(this)
    this.handleSaveChanges = this.handleSaveChanges.bind(this)
    this.handleRadioChange = this.handleRadioChange.bind(this)
  }

  getStateHash() {
    return this.state.accessToken + ' ' + this.state.selectedMode
  }

  getAxios() {
    return this.props.bp.axios
  }

  componentDidMount() {
    this.getAxios().get('/api/botpress-wit/config')
    .then((res) => {
      this.setState({
        loading: false,
        ...res.data
      })

      setImmediate(() => {
        this.setState({ initialStateHash: this.getStateHash() })
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

  handleSaveChanges() {
    this.setState({ loading:true })

    return this.getAxios().post('/api/botpress-wit/config', {
      accessToken: this.state.accessToken,
      selectedMode: this.state.selectedMode
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
          <Col sm={9}>
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
            checked={this.state.selectedMode === key}
            onChange={this.handleRadioChange} />
          {label}
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
          <Col sm={9}>
            {this.renderRadioButton('Understanding', 'understanding')}
            {this.renderRadioButton('Stories', 'stories')}
          </Col>
        </FormGroup>
      </Row>
    )
  }

  renderExplication() {
    return (
      <Row>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Explication
          </Col>
          <Col sm={9}>
            <FormControl readOnly name="explication"
              componentClass="textarea" rows="6"
              value={this.state.explication} />
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
    return (this.state.initialStateHash && this.state.initialStateHash !== this.getStateHash())
      ? <Button bsStyle="success" onClick={this.handleSaveChanges}>Save</Button>
      : null

  }

  render() {
    if (this.state.loading) {
      return <h4>Module is loading...</h4>
    }

    return (
      <Grid className={style.wit}>
        <Row>
          <Col md={8} mdOffset={2}>
            {this.renderMessageAlert()}
            <Panel className={style.panel} header="settings">
                {this.renderAccessToken()}
                {this.renderMode()}
                {this.renderExplication()}
                {this.renderSaveButton()}
            </Panel>
          </Col>
        </Row>
      </Grid>

    )
  }
}
