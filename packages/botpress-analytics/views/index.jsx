import React from 'react'
import ReactDOM from 'react-dom'
import {
  Col,
  Grid,
  Panel,
  Row,
  ControlLabel,
  Table
 } from 'react-bootstrap'
import axios from 'axios'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import style from './style.scss'
import _ from 'lodash'

const toPercent = (decimal, fixed = 0) => {
	return `${(decimal * 100).toFixed(fixed)}%`;
};

export default class AnalyticsModule extends React.Component {

  constructor(props) {
    super(props)
    this.state = {loading:true}
  }

  componentDidMount() {
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

  renderActiveUsersSimpleLineChart() {
    const data = this.state.activeUsersChartData

    const SimpleLineChart = React.createClass({
    	render () {
      	return (
          <ResponsiveContainer>
          	<LineChart data={data}
                  margin={{top: 5, right: 30, left: 20, bottom: 5}}>
             <XAxis dataKey="name"/>
             <YAxis/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey="facebook" stroke="#8884d8" activeDot={{r: 8}}/>
             <Line type="monotone" dataKey="slack" stroke="#de5454" />
             <Line type="monotone" dataKey="kik" stroke="#ffc658" />

            </LineChart>
          </ResponsiveContainer>
        );
      }
    })

    return <SimpleLineChart />
  }


  renderStackedLineChartForTotalUsers() {
    const data = this.state.totalUsersChartData;

    const StackedAreaChart = React.createClass( {
      render () {
        return (
          <ResponsiveContainer >
            <AreaChart data={data}
                  margin={{top: 20, right: 50, left: 0, bottom: 0}}>
              <XAxis dataKey="name"/>
              <YAxis/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip/>
              <Legend />
              <Area type='monotone' dataKey='facebook' stackId="1" stroke='#8884d8' fill='#8884d8' />
              <Area type='monotone' dataKey='slack' stackId="1" stroke='#de5454' fill='#de5454' />
              <Area type='monotone' dataKey='kik' stackId="1" stroke='#ffc658' fill='#ffc658' />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
    })
    return <StackedAreaChart />
  }



  renderGenderPercentAreaChart() {
    const data = this.state.genderUsageChartData

    const StackedAreaChart = React.createClass({
    	render () {
      	return (
          <ResponsiveContainer>
          	<AreaChart data={data} stackOffset="expand"
                  margin={{top: 10, right: 30, left: 0, bottom: 0}} >
              <XAxis dataKey="month"/>
              <YAxis tickFormatter={toPercent}/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip />
              <Legend />
              <Area type='monotone' dataKey='male' stackId="1" stroke='#8884d8' fill='#8884d8' />
              <Area type='monotone' dataKey='female' stackId="1" stroke='#de5454' fill='#de5454' />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
    })

    return <StackedAreaChart />
  }

  renderTypicalConversationLengthInADayChart() {
    const data = this.state.typicalConversationLengthInADay

    const SimpleBarChart = React.createClass({
    	render () {
      	return (
          <ResponsiveContainer>
            <BarChart data={data}
              margin={{top: 5, right: 30, left: 20, bottom: 5}}>
              <XAxis dataKey="name"/>
              <YAxis tickFormatter={toPercent}/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip />
              <Bar dataKey="percentage" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )
      }
    })

    return <SimpleBarChart />
  }

  renderSpecificMetricForLastDaysValues() {
    const data = this.state.specificMetricsForLastDays
    return (
      <div className={style.specificMetrics}>
        <h4>Average interaction</h4>
        <h1>{data.numberOfInteractionInAverage}</h1>

        <h4>Number of users</h4>
        <h3><small>Today :</small> {data.numberOfUsersToday}</h3>
        <h5><small>Yesterday :</small> {data.numberOfUsersYesterday}</h5>
        <h5><small>Week :</small> {data.numberOfUsersThisWeek}</h5>
      </div>
    )
  }


  renderRetentionHeatMapHeader(){
    return (
      <thead>
        <tr>
          <th>Date</th>
          <td>Day 1</td>
          <td>Day 2</td>
          <td>Day 3</td>
          <td>Day 4</td>
          <td>Day 5</td>
          <td>Day 6</td>
          <td>Day 7</td>
        </tr>
      </thead>
    )
  }

  renderRetentionData(value, i){
    const opacity = value
    const bgStyle = {
      'backgroundColor': 'rgba(0, 177, 92,' + opacity + ')'
     }
    return <td style={bgStyle} key={i}>{toPercent(value)}</td>
  }

  renderRetentionRow(rowValues, key){
    const date = key
    const rowData = rowValues.map(this.renderRetentionData.bind(this))
    return (
      <tr key={date}>
        <th>{date}</th>
        {rowData}
      </tr>
    )
  }

  renderRetentionHeatMapBody() {
    const dataPerDate = _.mapValues(this.state.retentionHeatMap, this.renderRetentionRow.bind(this))
    return (
      <tbody key='retention'>
        {_.values(dataPerDate)}
      </tbody>
    )
  }

  renderRetentionHeatMapChart() {
    return (
      <Table striped bordered hover className={style.rententionHeatMap}>
        {this.renderRetentionHeatMapHeader()}
        {this.renderRetentionHeatMapBody()}
      </Table>
    )
  }

  renderBusyHoursHeatMapHeader() {
    const hours = []
    return (
      <thead>
        <tr>
          <th>Date / Hours</th>
          <td>0</td><td>&nbsp;</td><td>&nbsp;</td>
          <td>3</td><td>&nbsp;</td><td>&nbsp;</td>
          <td>6</td><td>&nbsp;</td><td>&nbsp;</td>
          <td>9</td><td>&nbsp;</td><td>&nbsp;</td>
          <td>12</td><td>&nbsp;</td><td>&nbsp;</td>
          <td>15</td><td>&nbsp;</td><td>&nbsp;</td>
          <td>18</td><td>&nbsp;</td><td>&nbsp;</td>
          <td>21</td><td>&nbsp;</td><td>&nbsp;</td>
          <td>24</td>
        </tr>
      </thead>
    )
  }

  renderBusyHoursData(value, i) {
    const opacity = value
    const bgStyle = {
      'backgroundColor': 'rgba(255, 145, 0,' + opacity + ')'
     }
    return <td style={bgStyle} key={i}>&nbsp;</td>
  }

  renderBusyHoursRow(rowValues, key) {
    const date = key
    const rowData = rowValues.map(this.renderBusyHoursData.bind(this))
    return (
      <tr key={date}>
        <th>{date}</th>
          {rowData}
      </tr>
    )
  }

  renderBusyHoursHeatMapBody() {
    const dataPerDate = _.mapValues(this.state.busyHoursHeatMap, this.renderBusyHoursRow.bind(this))
    return (
      <tbody key='busyhours'>
        {_.values(dataPerDate)}
      </tbody>
    )
  }

  renderBusyHoursHeatMapChart() {
    return (
      <Table className={style.busyHoursHeatMap}>
        {this.renderBusyHoursHeatMapHeader()}
        {this.renderBusyHoursHeatMapBody()}
      </Table>
    )
  }

  renderTotalNumberOfUsersPanel() {
    return(
      <Panel header='Total number of users'>
        <div className={style.graphContainer}>
          {this.renderStackedLineChartForTotalUsers()}
        </div>
      </Panel>
    )
  }

  renderActiveUsersPanel() {
    return(
      <Panel header='Active users for last 30 days'>
        <div className={style.graphContainerTwoColumn}>
          {this.renderActiveUsersSimpleLineChart()}
        </div>
      </Panel>
    )
  }

  renderGenderUsagePanel() {
    return(
      <Panel header='Gender usage for last 7 days'>
        <div className={style.graphContainerTwoColumn}>
          {this.renderGenderPercentAreaChart()}
        </div>
      </Panel>
    )
  }

  renderSpecificMetricForLastDaysPanel() {
      return(
        <Panel header='Specific metrics for last days'>
          <div className={style.graphContainerTwoColumn}>
            {this.renderSpecificMetricForLastDaysValues()}
          </div>
        </Panel>
      )
  }

  renderTypicalConversationInADayPanel() {
    return(
      <Panel header='Typical conversation in a day'>
        <div className={style.graphContainerTwoColumn}>
          {this.renderTypicalConversationLengthInADayChart()}
        </div>
      </Panel>
    )
  }

  renderRetentionHeatMapPanel() {
    return (
      <Panel header='Rentention for last 7 days'>
        <div className={style.graphContainer}>
          {this.renderRetentionHeatMapChart()}
        </div>
      </Panel>
    )
  }

  renderBusyHoursHeatMapPanel() {
    return (
      <Panel header='Busy hours for last 7 days'>
        <div className={style.graphContainer}>
          {this.renderBusyHoursHeatMapChart()}
        </div>
      </Panel>
    )
  }


  renderBasicMetrics() {
    return (
      <Grid fluid >
        <Row>
          <Col md={12}>
            {this.renderTotalNumberOfUsersPanel()}
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            {this.renderActiveUsersPanel()}
          </Col>
          <Col md={6}>
            {this.renderGenderUsagePanel()}
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            {this.renderSpecificMetricForLastDaysPanel()}
          </Col>
          <Col md={8}>
            {this.renderTypicalConversationInADayPanel()}
          </Col>
        </Row>
      </Grid>
    )
  }

  renderAdvancedMetrics(){
    return (
      <Grid fluid >
        <Row>
          <Col md={12}>
            {this.renderRetentionHeatMapPanel()}
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            {this.renderBusyHoursHeatMapPanel()}
          </Col>
        </Row>
      </Grid>
    )
  }

  renderAllMetrics(){
    return(
      <div>
        <Panel header='Basic metrics'>
          {this.renderBasicMetrics()}
        </Panel>
        <Panel header='Advanced metrics'>
          {this.renderAdvancedMetrics()}
        </Panel>
      </div>
    )
  }

  render() {
    return <div>
      {this.state.loading ? null : this.renderAllMetrics()}
    </div>
  }
}
