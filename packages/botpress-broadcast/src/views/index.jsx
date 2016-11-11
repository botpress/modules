import React from 'react'
import ReactDOM from 'react-dom'

import {
  Nav,
  NavItem,
  Navbar,
  Button,
  Glyphicon,
  Panel,
  Table
} from 'react-bootstrap'

import style from './style.scss'

export default class BroadcastModule extends React.Component {

  constructor(props){
    super(props)

    this.createBroadcast = this.createBroadcast.bind(this)
    this.copyBroadcast = this.copyBroadcast.bind(this)
    this.modifyBroadcast = this.modifyBroadcast.bind(this)
    this.removeBroadcast = this.removeBroadcast.bind(this)
  }

  createBroadcast(id) {

  }

  copyBroadcast(id) {

  }

  modifyBroadcast(id) {

  }

  removeBroadcast(id) {

  }

  renderTableHeader() {
    return (
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Time</th>
          <th>Type</th>
          <th>Content</th>
          <th>Condition</th>
          <th>Send</th>
          <th>Action</th>
        </tr>
      </thead>
    )
  }
  
  renderPlannedBroadcastTable() {
    return (
      <Table striped bordered condensed hover>
        {this.renderTableHeader()}
        <tbody>
          <tr>
            <td>1</td>
            <td>23 oct</td>
            <td>12:00</td>
            <td>javascript</td>
            <td>"skin.messenger.pipeText(...)"</td>
            <td>male only</td>
            <td>100%</td>
            <td>
              <Button onClick={this.modifyBroadcast}>
                <Glyphicon glyph='file'></Glyphicon>
              </Button>
              <Button onClick={this.copyBroadcast}>
                <Glyphicon glyph='copy'></Glyphicon>
              </Button>
              <Button onClick={this.removeBroadcast}>
                <Glyphicon glyph='trash'></Glyphicon>
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    )
  }

  render() {
    return (
      <div>
        <Navbar fluid collapseOnSelect className={style.navbar}>
          <Navbar.Header>
            <Navbar.Brand>
              Planned broadcast
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              <NavItem>
                <Button onClick={this.createBroadcast}>
                  <Glyphicon glyph='file'></Glyphicon>
                </Button>
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Panel className={style.mainPanel}>
          {this.renderPlannedBroadcastTable()}
        </Panel>
      </div>
    )
  }
}
