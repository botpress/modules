import React from 'react'
import ReactDOM from 'react-dom'
import { Panel } from 'react-bootstrap'
import axios from 'axios'
const Recharts = require('recharts')

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

  renderSimpleLineChart(){
    const data = this.state.simpleLineChart

    const {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} = Recharts

    const SimpleLineChart = React.createClass({
    	render () {
      	return (
        	<LineChart width={600} height={300} data={data}
                margin={{top: 5, right: 30, left: 20, bottom: 5}}>
           <XAxis dataKey="name"/>
           <YAxis/>
           <CartesianGrid strokeDasharray="3 3"/>
           <Tooltip/>
           <Legend />
           <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{r: 8}}/>
           <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
          </LineChart>
        );
      }
    })

    return <SimpleLineChart />
  }

  renderGraphs(){
    return(
      <div>
        <div>{this.renderSimpleLineChart()}</div>
      </div>
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
