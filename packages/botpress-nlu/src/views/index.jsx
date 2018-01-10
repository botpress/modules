import React from 'react'
import classnames from 'classnames'
import { Collapse } from 'react-bootstrap'
import _ from 'lodash'

// TODO remove that
import mock from './mock'

import IntentEditor from './intents'

import style from './style.scss'

export default class Module extends React.Component {
  state = {
    showNavIntents: true,
    intents: [],
    currentIntent: null,
    filterValue: ''
  }

  componentDidMount() {
    this.fetchIntents()
  }

  fetchIntents = () => {
    return this.props.bp.axios.get('/api/botpress-nlu/intents')
    .then(res => {
      const dataToSet = { intents: res.data }

      if (!this.state.currentIntent) {
        dataToSet.currentIntent = _.get(_.first(res.data), 'name')
      }

      this.setState(dataToSet)
    })
  }

  toggleProp = prop => () => {
    this.setState({ [prop]: !this.state[prop] })
  }

  getIntents = () => this.state.intents || []

  getCurrentIntent = () => _.find(this.getIntents(), { name: this.state.currentIntent })

  onFilterChanged = event => this.setState({ filterValue: event.target.value })

  setCurrentIntent = name => {
    if (this.state.currentIntent !== name) {
      if (this.intentEditor && this.intentEditor.onBeforeLeave) {
        if (this.intentEditor.onBeforeLeave() !== true) {
          return
        }
      }

      this.setState({ currentIntent: name })
    }
  }

  renderCategory() {
    const intents = this.getIntents().filter(i => {
      if (this.state.filterValue.length) {
        return i.name.toLowerCase().includes(this.state.filterValue.toLowerCase())
      }

      return true
    })

    const caret = classnames(style.caret, {
      [style.inverted]: !this.state.showNavIntents
    })

    const getClassName = el =>
      classnames({
        [style.active]: this.getCurrentIntent() === el
      })

    return (
      <div>
        <div>
          <span>Intents ({intents.length})</span>
          <span className={caret} onClick={this.toggleProp('showNavIntents')}>
            <span className="caret" />
          </span>
        </div>
        <Collapse in={this.state.showNavIntents}>
          <ul>
            {intents.map(el => (
              <li className={getClassName(el)} onClick={() => this.setCurrentIntent(el.name)}>
                {el.name}
              </li>
            ))}
          </ul>
        </Collapse>
      </div>
    )
  }

  render() {
    return (
      <div className={style.workspace}>
        <div>
          <div className={style.main}>
            <nav className={style.navigationBar}>
              <div className={style.filter}>
                <input
                  type="text"
                  value={this.state.filterValue}
                  placeholder="filter..."
                  onChange={this.onFilterChanged}
                />
              </div>
              <div className={style.list}>{this.renderCategory()}</div>

              <div className={style.create}>
                <button>Create new...</button>
              </div>
            </nav>
            <div className={style.childContent}>
              <IntentEditor
                ref={el => (this.intentEditor = el)}
                intent={this.getCurrentIntent()}
                router={this.props.router}
                axios={this.props.bp.axios}
                reloadIntents={this.fetchIntents}
              />
            </div>
          </div>
          {/*<footer>Hello, footer</footer>*/}
        </div>
      </div>
    )
  }
}
