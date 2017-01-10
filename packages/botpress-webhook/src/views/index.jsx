import React from 'react'
import ReactDOM from 'react-dom'
import {
  Col,
  Button,
  Panel,
  Checkbox,
  Label,
  Alert,
  Row,
  ControlLabel,
  FormControl,
  Collapse,
  Form,
  FormGroup
} from 'react-bootstrap'
//import Toggle from 'react-toggle'
//import TagsInput from 'react-tagsinput'
import _ from 'lodash'
import Promise from 'bluebird'

//import 'react-tagsinput/react-tagsinput.css'
//import 'react-toggle/style.css'
import style from './style.scss'

const apiUrl = url => '/api/botpress-webhook/' + url

export default class WebhookModule extends React.Component {

   constructor(props) {
    super(props)

    this.state = {
      platforms: [],
      loading: true,
      error: null
    }
  }

  componentDidMount() {
    this.reloadAll()
  }

  reloadAll() {
    this.setState({ loading: true })
    this.fetchPlatforms()
    .then(() => this.setState({ loading: false }))
  }

  fetchPlatforms() {
    const { axios } = this.props.bp
    return axios.get(apiUrl('platforms'))
    .then(({data}) => this.setState({ platforms: data }))
    .catch(err => {
      this.setState({ error: 'An error occured' }) // TODO Change this
    })
  }

  renderCreateNew() {
    return <Button bsStyle="primary" className="pull-right" 
      onClick={::this.createNew}>
      Create new
    </Button>
  }

  createNew() {
    // TODO Change this to a beautiful popup
    const platform = window.prompt('Please input the name of the platform')

    const { axios } = this.props.bp
    axios.put(apiUrl('platforms/' + platform))
    .then(::this.fetchPlatforms)
  }

  delete(ptfm) {
    const confirm = window.confirm('Delete platform ' + ptfm + '. Are you sure?')
    if (!confirm) {
      return
    }

    const { axios } = this.props.bp
    axios.delete(apiUrl('platforms/' + ptfm))
    .then(::this.fetchPlatforms) 
  }


  renderSinglePlatform(ptfm) {

    const header = <span>
      Platform <strong>{ptfm}</strong>
    </span>

    const footer = <div className="pull-right">
      <Button bsStyle="default" onClick={() => this.delete(ptfm)}>Delete</Button>
    </div>

    return <Panel collapsible={false} key={ptfm} header={header} footer={footer}></Panel>
  }

  renderAllPlatforms() {
    const { platforms } = this.state

    if (!platforms.length) {
      return <h3 className={style.center}>There are no platforms</h3>
    }

    return platforms.map(::this.renderSinglePlatform)
  }

  renderLoading() {
    return <h1>Loading...</h1>
  }

  renderError() {
    return <Panel header='Error' bsStyle='danger'>
      {this.state.error}
    </Panel>
  }

  render() {
    const { error, loading } = this.state

    if (loading) {
      return this.renderLoading()
    }

    return <div className={style.platforms}>
      {error && this.renderError()}
      <Row>
        <Col md={12}>{this.renderCreateNew()}</Col>
      </Row>
      <Row>
        <Col mdOffset={2} md={8}>{::this.renderAllPlatforms()}</Col>
      </Row>
    </div>
  }
}
