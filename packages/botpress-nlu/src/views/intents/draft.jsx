{
  /*<link rel="stylesheet" href="../../../dist/Draft.css" />*/
}

import React from 'react'
import { Badge } from 'react-bootstrap'
import Promise from 'bluebird'
import {
  Editor,
  EditorState,
  KeyBindingUtil,
  getDefaultKeyBinding,
  CompositeDecorator,
  Modifier,
  SelectionState
} from 'draft-js'
import { getSelectionEntity, getSelectedBlock } from 'draftjs-utils'

import classnames from 'classnames'
import SplitterLayout from 'react-splitter-layout'

import style from './style.scss'

require('draft-js/dist/Draft.css')

function myKeyBindingFn(e) {
  if (e.keyCode === 13) {
    return 'prevent-enter'
  } else if (e.keyCode === 83 /* `S` key */ && KeyBindingUtil.hasCommandModifier(e)) {
    return 'myeditor-save'
  }
  return getDefaultKeyBinding(e)
}

function getEntityStrategy(type) {
  return function(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity()
      if (entityKey === null) {
        return false
      }
      return contentState.getEntity(entityKey).getType() === type
    }, callback)
  }
}

export function getSelectionFirstEntity(editorState) {
  let entity
  const selection = editorState.getSelection()
  let start = selection.getStartOffset()
  let end = selection.getEndOffset()

  if (start === end && start === 0) {
    end = 1
  } else if (start === end) {
    start -= 1
  }

  const block = getSelectedBlock(editorState)

  for (let i = start; i < end; i += 1) {
    const currentEntity = block.getEntityAt(i)
    if (currentEntity) {
      return currentEntity
    }
  }
  return entity
}

const TokenSpan = props => {
  const entity = props.contentState.getEntity(props.entityKey)
  // const style = entity.getData().style
  const className = `entity-${entity.getType().toLowerCase()}`

  return (
    <span data-offset-key={props.offsetkey} className={style[className]}>
      {props.children}
    </span>
  )
}

const decorator = new CompositeDecorator([
  {
    strategy: getEntityStrategy('LABEL'),
    component: TokenSpan
  }
])

function getInitialContent() {
  return EditorState.createEmpty(decorator)
}

export default class IntentsEditor extends React.Component {
  state = {
    content: '',
    initialContent: '',
    editorState: getInitialContent()
  }

  onEnterAction = null

  onChange = editorState => this.setState({ editorState })

  handleKeyCommand = command => {
    if (command === 'myeditor-save') {
      return 'handled'
    } else if (command === 'prevent-enter') {
      if (this.onEnterAction) {
        console.log('ON ENTER ACTION TRIGGERED')
        this.onEnterAction()
        this.onEnterAction = null
      }

      return 'handled'
    }
    return 'not-handled'
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

  isDirty = () => this.state.content !== this.state.initialContent

  fetchEntities = () => {
    return this.props.axios.get(`/api/botpress-nlu/entities`).then(res => res.data)
  }

  renderEditor() {
    let selection = this.state.editorState.getSelection()
    const anchorKey = selection.getAnchorKey()
    const currentContent = this.state.editorState.getCurrentContent()
    const currentBlock = currentContent.getBlockForKey(anchorKey)

    const start = selection.getStartOffset()
    const end = selection.getEndOffset()
    const selectedText = currentBlock.getText().slice(start, end)

    let existingEntity = getSelectionFirstEntity(this.state.editorState)

    if (existingEntity) {
      existingEntity = this.state.editorState.getCurrentContent().getEntity(existingEntity)
    }

    const tagSelected = () => {
      const contentState = this.state.editorState.getCurrentContent()
      const contentStateWithEntity = contentState.createEntity('LABEL', 'MUTABLE', { style: { color: 'red' } })

      const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
      const contentStateWithLink = Modifier.applyEntity(contentStateWithEntity, selection, entityKey)

      const newSelection = Math.max(selection.anchorOffset, selection.focusOffset) + 1

      const updateSelection = new SelectionState({
        anchorKey: selection.anchorKey,
        anchorOffset: newSelection,
        focusKey: selection.anchorKey,
        focusOffset: newSelection,
        isBackward: false
      })

      console.log(selection.serialize())

      const nextEditorState = EditorState.forceSelection(
        EditorState.push(this.state.editorState, contentStateWithLink, 'added-label'),
        updateSelection
      )

      this.onChange(nextEditorState)
    }

    let selectionDiv = <span>Select text to tag entities</span>
    if (selectedText.length) {
      this.onEnterAction = tagSelected
      if (existingEntity) {
        selectionDiv = (
          <span onClick={tagSelected}>
            Tag "{selectedText}" with "{existingEntity.getType()}"
          </span>
        )
      } else {
        selectionDiv = <span onClick={tagSelected}>Tag "{selectedText}" with entity</span>
      }
    }

    return (
      <div className={style.editorContainer}>
        <div className={style.editor}>
          <Editor
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={myKeyBindingFn}
            editorState={this.state.editorState}
            onChange={this.onChange}
          />
        </div>
        <div>{selectionDiv}</div>
      </div>
    )
  }

  renderNone() {
    return (
      <div>
        <h1>No intent selected</h1>
      </div>
    )
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
        {/*<SplitterLayout>*/}
        {this.renderEditor()}
        {/*<div className={style.markdown}>*/}
        {/*<ReactMarkdown source={this.state.content} />*/}
        {/*</div>*/}
        {/*</SplitterLayout>*/}
      </div>
    )
  }
}
