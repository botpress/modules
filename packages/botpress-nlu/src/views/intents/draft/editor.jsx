import React from 'react'
import { OverlayTrigger, Popover, Button } from 'react-bootstrap'

import {
  Editor,
  EditorState,
  KeyBindingUtil,
  getDefaultKeyBinding,
  CompositeDecorator,
  Modifier,
  SelectionState
} from 'draft-js'

import { mergeEntities, removeEntity, getSelectionFirstEntity, getSelectionText } from './extensions'

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

const TokenSpanFactory = ({ getEditorState, setEditorState }) => props => {
  const removeLabel = () => {
    const editorState = removeEntity(getEditorState(), props.entityKey)
    setEditorState(editorState)
  }

  const popover = (
    <Popover id="popover-positioned-bottom" title="">
      <Button bsSize="xsmall" bsStyle="link" onClick={removeLabel}>
        Remove label
      </Button>
    </Popover>
  )

  const entity = props.contentState.getEntity(props.entityKey)
  const className = `entity-${entity.getType().toLowerCase()}`

  return (
    <span data-offset-key={props.offsetkey} className={style[className]}>
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
    setEditorState: state => this.setState({ editorState: state })
  }

  state = {
    editorState: getInitialContent(this.actions)
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

  onBlur = () => {
    this.onEnterAction = null
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

  tagSelected = () => {
    let selection = this.state.editorState.getSelection()
    const contentState = this.state.editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity('LABEL', 'MUTABLE', { name: 'any' })

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

  render() {
    const selectedText = getSelectionText(this.state.editorState)
    let existingEntity = getSelectionFirstEntity(this.state.editorState)
    if (existingEntity) {
      existingEntity = this.state.editorState.getCurrentContent().getEntity(existingEntity)
    }

    let selectionDiv = <span>Select text to tag entities</span>
    if (selectedText.length) {
      this.onEnterAction = this.tagSelected
      if (existingEntity) {
        selectionDiv = (
          <span onClick={this.tagSelected}>
            Tag "{selectedText}" with "{existingEntity.getType()}"
          </span>
        )
      } else {
        selectionDiv = <span onClick={this.tagSelected}>Tag "{selectedText}" with entity</span>
      }
    }

    return (
      <div className={style.editorContainer}>
        <div className={style.editor}>
          <Editor
            handleBeforeInput={this.handleBeforeInput}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={myKeyBindingFn}
            editorState={this.state.editorState}
            onChange={this.onChange}
            onBlur={this.onBlur}
          />
        </div>
        <div>{selectionDiv}</div>
      </div>
    )
  }
}
