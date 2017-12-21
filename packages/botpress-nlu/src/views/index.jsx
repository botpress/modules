import React from 'react'
import classnames from 'classnames'
import SplitterLayout from 'react-splitter-layout'
import { Collapse } from 'react-bootstrap'

import style from './style.scss'

export default class Module extends React.Component {
  state = {
    showNavIntents: true
  }

  toggleProp = prop => () => {
    this.setState({ [prop]: !this.state[prop] })
  }

  renderCategory() {
    const caret = classnames(style.caret, {
      [style.inverted]: !this.state.showNavIntents
    })

    return (
      <div>
        <div>
          <span>Intents (5)</span>
          <span className={caret} onClick={this.toggleProp('showNavIntents')}>
            <span className="caret" />
          </span>
        </div>
        <Collapse in={this.state.showNavIntents}>
          <ul>
            <li>Hello1</li>
            <li>Hello1</li>
            <li>Hello1</li>
            <li>Hello1</li>
            <li>Hello1</li>
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
                <input type="text" value="filter..." />
              </div>
              <div className={style.list}>{this.renderCategory()}</div>

              <div className={style.create}>
                <button>Create new...</button>
              </div>

            </nav>
            <div className={style.childContent}>
              <div className={style.header}>Header</div>
              <SplitterLayout>
                <div>Pane 1</div>
                <div>Pane 2</div>
              </SplitterLayout>
            </div>
          </div>
          <footer>Hello, footer</footer>
        </div>
      </div>
    )
  }
}
