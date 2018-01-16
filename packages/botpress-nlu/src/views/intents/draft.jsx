import React from 'react'
import { Badge } from 'react-bootstrap'

import classnames from 'classnames'
import SplitterLayout from 'react-splitter-layout'
import nanoid from 'nanoid'

import Editor from './draft/editor'

import style from './style.scss'
import EntitiesEditor from './entities/index'

export default class IntentsEditor extends React.Component {
  state = {
    content: '',
    initialContent: '',
    entitiesEditor: null,
    entities: [
      {
        id: '0',
        colors: 1,
        name: 'DepartureDate',
        type: '@native.date'
      },
      {
        id: '1',
        colors: 3,
        name: 'ArrivalDate',
        type: '@native.date'
      },
      {
        id: '2',
        colors: 5,
        name: 'PassengerCount',
        type: '@native.number'
      }
    ],
    utterances: []
  }

  firstUtteranceRef = null

  componentDidMount() {
    this.initiateStateFromProps(this.props)

    if (this.props.router) {
      this.props.router.registerTransitionHook(this.onBeforeLeave)
    }
  }

  componentWillUnmount() {
    if (this.props.router) {
      this.props.router.unregisterTransitionHook(this.onBeforeLeave)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.intent !== this.props.intent) {
      this.initiateStateFromProps(nextProps)
    }
  }

  initiateStateFromProps(props) {
    const { content } = (props && props.intent) || { content: '' }
    this.setState({ content: content, initialContent: content })
  }

  deleteIntent = () => {
    if (!confirm('Are you sure you want to delete this intent? This is not revertable.')) {
      return
    }

    this.props.axios.delete(`/api/botpress-nlu/intents/${this.props.intent.name}`).then(() => {
      this.props.reloadIntents && this.props.reloadIntents()
    })
  }

  saveIntent = () => {
    this.props.axios
      .post(`/api/botpress-nlu/intents/${this.props.intent.name}`, { content: this.state.content })
      .then(() => {
        this.props.reloadIntents && this.props.reloadIntents()
      })
  }

  onBeforeLeave = () => {
    if (this.isDirty()) {
      return confirm('You have unsaved changed that will be lost. Are you sure you want to leave?')
    }

    return true
  }

  isDirty = () => this.state.content !== this.state.initialContent

  fetchEntities = () => {
    return this.props.axios.get(`/api/botpress-nlu/entities`).then(res => res.data)
  }

  focusFirstUtterance = () => {
    if (this.firstUtteranceRef) {
      this.firstUtteranceRef.focus()
    }
  }

  renderEditor() {
    const utterances = this.getUtterances()
    const preprendNewUtterance = () => {
      this.setState({ utterances: [{ id: nanoid(), text: '' }, ...utterances] })
    }

    return (
      <ul className={style.utterances}>
        {utterances.map((utterance, i) => {
          return (
            <li key={`uttr-${utterance.id}`}>
              <Editor
                getEntitiesEditor={() => this.entitiesEditor}
                ref={el => {
                  if (i === 0) {
                    this.firstUtteranceRef = el
                  }
                }}
                onDone={this.focusFirstUtterance}
                onInputConsumed={preprendNewUtterance}
                entities={this.state.entities}
              />
            </li>
          )
        })}
      </ul>
    )
  }

  renderNone() {
    return (
      <div>
        <h1>No intent selected</h1>
      </div>
    )
  }

  onEntitiesChanged = entities => {
    this.setState({ entities })
  }

  getUtterances = () => {
    let utterances = this.state.utterances

    if (!utterances.length) {
      utterances = [{ id: nanoid(), text: '' }]
      this.setState({ utterances })
    }

    return utterances
  }

  render() {
    if (!this.props.intent) {
      return this.renderNone()
    }

    const { name } = this.props.intent

    const dirtyLabel = this.isDirty() ? <Badge>Unsaved changes</Badge> : null

    return (
      <div className={style.container}>
        <div className={style.header}>
          <div className="pull-left">
            <h1>
              intents/<span className={style.intent}>{name}</span>
              {dirtyLabel}
            </h1>
          </div>
          <div className="pull-right">
            <button onClick={this.saveIntent} disabled={!this.isDirty()}>
              Save
            </button>
            <button onClick={this.deleteIntent}>Delete</button>
          </div>
        </div>
        <SplitterLayout>
          {this.renderEditor()}
          <div className={style.entitiesPanel}>
            <EntitiesEditor
              axios={this.props.axios}
              ref={el => (this.entitiesEditor = el)}
              entities={this.state.entities}
              onEntitiesChanged={this.onEntitiesChanged}
            />
          </div>
        </SplitterLayout>
      </div>
    )
  }
}
