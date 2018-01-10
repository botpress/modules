import React from 'react'
import { Badge } from 'react-bootstrap'
import classnames from 'classnames'
import SplitterLayout from 'react-splitter-layout'
import MonacoEditor from 'react-monaco-editor'
import ReactMarkdown from 'react-markdown'

import style from './style.scss'

export default class IntentsEditor extends React.Component {
  state = {
    content: '',
    initialContent: ''
  }

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

  onChange = newValue => {
    this.setState({ content: newValue })
  }

  isDirty = () => this.state.content !== this.state.initialContent

  renderEditor() {
    const requireConfig = {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
      paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.10.1/min/vs/'
      }
    }

    return (
      <MonacoEditor
        language="markdown"
        theme="vs"
        onChange={this.onChange}
        height="95%"
        width="100%"
        value={this.state.content}
        options={{
          scrollBar: {
            vertical: 'visible'
          }
        }}
        requireConfig={requireConfig}
      />
    )
  }

  renderNone() {
    return <div>
      <h1>No intent selected</h1>
    </div>
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
          <div className={style.markdown}>
            <ReactMarkdown source={this.state.content} />
          </div>
        </SplitterLayout>
      </div>
    )
  }
}
