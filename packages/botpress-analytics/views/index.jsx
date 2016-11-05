import React from 'react'
import ReactDOM from 'react-dom'
import { Panel } from 'react-bootstrap'
import axios from 'axios'

import style from './style.scss'

export default class AnalyticsModule extends React.Component {

  constructor(props){
    super(props)
    this.state = {loading:true}
  }

  componentDidMount(){
    axios.get("/api/skin-analytics/graphs")
    .then((res) => {
      this.setState({
        loading:false,
        ...res.data
      })
    });
  }

  renderErrorMessage() {
    return <p className={style.errorMessage}>
      {this.state.error}
    </p>
  }

  renderGraphs(){
    return(
      <div>{this.state.data}</div>
    )
  }

  renderMainPanel(){
    let style = 'info'
    let header = 'Analytics'

    return <Panel header={header} bsStyle={style}>
      {this.renderGraphs()}
    </Panel>
  }

  render() {
    return <div>
      {this.state.loading ? null : this.renderMainPanel()}
    </div>
  }
}
