import React from 'react'
import { OverlayTrigger, Popover, Button } from 'react-bootstrap'
import _ from 'lodash'
import classnames from 'classnames'

import {
  Editor,
  EditorState,
  KeyBindingUtil,
  getDefaultKeyBinding,
  CompositeDecorator,
  Modifier,
  SelectionState
} from 'draft-js'

import { mergeEntities, removeEntity, getSelectionFirstEntity, getSelectionText, countChars } from './extensions'

import style from './style.scss'
import colors from '../colors.scss'

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

const TokenSpanFactory = ({ getEditorState, setEditorState, getEntity }) => props => {
  const entity = props.contentState.getEntity(props.entityKey)
  const { entityId } = entity.getData()
  const nluEntity = getEntity(entityId)

  const removeLabel = () => {
    const editorState = removeEntity(getEditorState(), props.entityKey)
    setEditorState(editorState)
  }

  const popover = (
    <Popover id="popover-positioned-bottom" title="">
      <Button bsSize="xsmall" bsStyle="link" onClick={removeLabel}>
        Remove "{nluEntity.name}" label
      </Button>
    </Popover>
  )

  const className = classnames(
    colors[`label-colors-${nluEntity.colors}`],
    style[`entity-${entity.getType().toLowerCase()}`]
  )

  return (
    <span data-offset-key={props.offsetkey} className={className}>
      <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popover}>
        <span>{props.children}</span>
      </OverlayTrigger>
    </span>
  )
}

const createDecorator = actions =>
  new CompositeDecorator([
    {
      strategy: getEntityStrategy('LABEL'),
      component: TokenSpanFactory(actions)
    }
  ])

function getInitialContent(actions) {
  return EditorState.createEmpty(createDecorator(actions))
}

export default class IntentEditor extends React.Component {
  actions = {
    getEditorState: () => this.state.editorState,
    setEditorState: state => this.setState({ editorState: state }),
    getEntity: entityId => _.find(this.props.entities, { id: entityId })
  }

  domRef = null
  wasConsumed = false

  state = {
    editorState: getInitialContent(this.actions),
    hasFocus: false
  }

  onChange = editorState => {
    const beforeState = this.state.editorState

    this.setState({ editorState })

    if (countChars(beforeState) === 0 && countChars(editorState) > 0 && !this.wasConsumed) {
      this.props.onInputConsumed && this.props.onInputConsumed()
      this.wasConsumed = true
    }
  }

  focus = () => {
    if (this.domRef) {
      this.domRef.focus()
    }
  }

  handleKeyCommand = command => {
    if (command === 'prevent-enter') {
      const selection = this.state.editorState.getSelection()

      if (selection.isCollapsed()) {
        this.props.onDone && this.props.onDone()
      }

      const editor = this.props.getEntitiesEditor()
      if (editor) {
        editor.executeRecommendedAction(this)
      }

      return 'handled'
    }
    return 'not-handled'
  }

  handleBeforeInput = chars => {
    const state = this.state.editorState
    const selection = state.getSelection()

    if (!selection.isCollapsed()) {
      return false
    }

    const startOffset = selection.getStartOffset()
    const content = state.getCurrentContent()
    const block = content.getBlockForKey(selection.getStartKey())

    const entity = block.getEntityAt(startOffset)
    if (entity === null) {
      const style = state.getCurrentInlineStyle()
      const newContent = Modifier.insertText(content, selection, chars, style, null)
      this.onChange(EditorState.push(state, newContent, 'insert-characters'))
      return 'handled'
    }

    return 'not-handled'
  }

  tagSelected = entityId => {
    let selection = this.state.editorState.getSelection()
    const contentState = this.state.editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity('LABEL', 'MUTABLE', { entityId: entityId })

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

    const nextEditorState = EditorState.forceSelection(
      mergeEntities(EditorState.push(this.state.editorState, contentStateWithLink, 'added-label')),
      updateSelection
    )

    this.onChange(nextEditorState)
  }

  onArrow = action => keyboardEvent => {
    const editor = this.props.getEntitiesEditor()
    let selection = this.state.editorState.getSelection()

    console.log(selection, selection.isCollapsed())

    if (editor) {
      editor[action] && editor[action]()
      keyboardEvent.preventDefault()
    }
  }

  render() {
    const selectedText = getSelectionText(this.state.editorState)
    let selectedEntity = getSelectionFirstEntity(this.state.editorState)
    let selectedEntityId = null

    if (selectedEntity) {
      const entity = this.state.editorState.getCurrentContent().getEntity(selectedEntity)
      selectedEntityId = entity.getData().entityId
    }

    const editor = this.props.getEntitiesEditor()

    if (editor) {
      editor.setSelection(selectedText, selectedEntityId, this)
    }

    const onFocus = e => {
      this.setState({ hasFocus: true })
    }

    const onBlur = e => {
      var currentTarget = e.currentTarget

      setImmediate(() => {
        if (!currentTarget.contains(document.activeElement)) {
          this.setState({ hasFocus: false })
        }
      })
    }

    const className = classnames(style.editorContainer, {
      [style.focus]: this.state.hasFocus
    })

    return (
      <div className={className} tabIndex={0} onBlur={onBlur} onFocus={onFocus}>
        <div className={style.editor}>
          <Editor
            handleBeforeInput={this.handleBeforeInput}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={myKeyBindingFn}
            editorState={this.state.editorState}
            onChange={this.onChange}
            placeholder="Type to create a new utterance"
            onBlur={this.onBlur}
            ref={el => (this.domRef = el)}
            onUpArrow={this.onArrow('moveUp')}
            onDownArrow={this.onArrow('moveDown')}
            onTab={this.onArrow('moveDown')}
          />
        </div>
        <div className={style.controls}>
          <span className={style.action} onClick={() => {}}>Delete Utterance</span>
        </div>
      </div>
    )
  }
}
