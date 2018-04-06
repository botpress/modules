import React from 'react'

import { ListGroup, ListGroupItem, Alert, Tabs, Tab } from 'react-bootstrap'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'

import style from './style.scss'

const SortableItem = SortableElement(({ value, onRemove, onChangeKeywords }) => (
  <ListGroupItem>
    <div>
      {value.value}{' '}
      <span className={style.action} onClick={onRemove}>
        Remove
      </span>
    </div>
    <div className={style.keywords}>
      {value.keywords.join(' ')}{' '}
      <span className={style.action} onClick={onChangeKeywords}>
        Edit keywords
      </span>
    </div>
  </ListGroupItem>
))

const pairsToObj = pairs => pairs.reduce((prev, [key, val]) => ({ ...prev, [key]: val}), {})

export default class TemplateModule extends React.Component {
  state = {
    choices: [],
    inputValue: '',
    nbMaxRetries: 1,
    questionValue: 'Please pick one of the following: ',
    invalidOptionValue: 'Invalid choice, please pick one of the following:',
    nameOfQuestionBloc: '#choice',
    nameOfInvalidBloc: '#choice',
    additionalLanguages: []
  }

  componentDidMount() {
    this.props.resizeBuilderWindow && this.props.resizeBuilderWindow('small')
    const getOrDefault = (propsKey, stateKey) => this.props.initialData[propsKey] || this.state[stateKey]

    fetch('/api/botpress-skill-choice/config')
      .then(res => res.json())
      .then(({ additionalLanguages }) => this.setState({ additionalLanguages }, () => {
        this.state.additionalLanguages.map(lang => [`questionValue${lang}`, `question${lang}`])
        if (this.props.initialData) {
          this.setState({
            choices: getOrDefault('choices', 'choices'),
            questionValue: getOrDefault('question', 'questionValue'),
            ...pairsToObj(
              this.state.additionalLanguages.map(lang =>
                [`questionValue${lang}`, this.props.initialData[`question${lang}`]]
              )
            ),
            nbMaxRetries: getOrDefault('maxRetries', 'nbMaxRetries'),
            invalidOptionValue: getOrDefault('invalid', 'invalidOptionValue'),
            nameOfQuestionBloc: getOrDefault('questionBloc', 'nameOfQuestionBloc'),
            nameOfInvalidBloc: getOrDefault('invalidBloc', 'nameOfInvalidBloc')
          })
        }
      }))
  }

  componentDidUpdate() {
    this.updateParent()
  }

  updateParent = () => {
    this.props.onDataChanged &&
      this.props.onDataChanged({
        choices: this.state.choices,
        question: this.state.questionValue,
        ...pairsToObj(
          this.state.additionalLanguages.map(lang => [`question${lang}`, this.state[`questionValue${lang}`]])
        ),
        maxRetries: this.state.nbMaxRetries,
        invalid: this.state.invalidOptionValue,
        questionBloc: this.state.nameOfQuestionBloc,
        invalidBloc: this.state.nameOfInvalidBloc
      })

    if (this.state.choices.length > 1) {
      this.props.onValidChanged && this.props.onValidChanged(true)
    }
  }

  onInputChange = event => {
    this.setState({ inputValue: event.target.value })
  }

  onQuestionChange = (lang = '') => event => this.setState({ [`questionValue${lang}`]: event.target.value })

  onInvalidOptionInputChanged = event => {
    this.setState({ invalidOptionValue: event.target.value })
  }

  onMaxRetriesChanged = event => {
    this.setState({ nbMaxRetries: isNaN(event.target.value) ? 1 : event.target.value })
  }

  onBlocNameChanged = key => event => {
    let blocName = event.target.value

    if (!blocName.startsWith('#')) {
      blocName = '#' + blocName
    }

    this.setState({ [key]: blocName })
  }

  onNameOfQuestionBlocChanged = this.onBlocNameChanged('nameOfQuestionBloc')
  onNameOfInvalidBlocChanged = this.onBlocNameChanged('nameOfInvalidBloc')

  onKeyPress = event => {
    if (event.key === 'Enter' && this.state.inputValue.length >= 0) {
      const value = this.state.inputValue
      const newChoice = { value: value, keywords: [value.toLowerCase()] }

      this.setState({
        choices: [...this.state.choices, newChoice],
        inputValue: ''
      })
    }
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      choices: arrayMove(this.state.choices, oldIndex, newIndex)
    })
  }

  renderValidationErrors() {
    let error = null

    if (this.state.choices.length < 2) {
      error = 'You need at least two choices'
    }

    return error ? <Alert bsStyle="warning">{error}</Alert> : null
  }

  removeChoice(index) {
    const choices = [...this.state.choices]
    _.pullAt(choices, index)
    this.setState({
      choices: choices
    })
  }

  changeKeywords(index) {
    const keywords = prompt(
      'Enter the keywords to be understood by as this choice, separated by commas',
      this.state.choices[index].keywords.join(', ')
    )

    this.setState({
      choices: this.state.choices.map((c, i) => {
        if (i !== index) {
          return c
        }

        return Object.assign({}, c, { keywords: keywords.split(',').map(k => k.trim().toLowerCase()) })
      })
    })
  }

  renderBasic() {
    const SortableList = SortableContainer(({ items }) => {
      return (
        <ListGroup>
          {items.map((value, index) => (
            <SortableItem
              key={`item-${index}`}
              index={index}
              value={value}
              onChangeKeywords={() => this.changeKeywords(index)}
              onRemove={() => this.removeChoice(index)}
            />
          ))}
        </ListGroup>
      )
    })

    return (
      <div className={style.content}>
        <p>This skill allows you to make the user pick a choice.</p>

        <p>
          <b>Question / text</b>
        </p>
        <textarea onChange={this.onQuestionChange()} value={this.state.questionValue} />
        {this.state.additionalLanguages.map(lang => (
          <div key={lang}>
            <p>
              <b>Question / text in {lang}</b>
            </p>
            <textarea onChange={this.onQuestionChange(lang)} value={this.state[`questionValue${lang}`]} />
          </div>
        ))}

        <p>
          <b>Choices</b>
        </p>
        <input
          className={style.newChoice}
          value={this.state.inputValue}
          type="text"
          placeholder="Type new choice here"
          onChange={this.onInputChange}
          onKeyPress={this.onKeyPress}
        />
        <SortableList
          pressDelay={200}
          helperClass={style.sortableHelper}
          items={this.state.choices}
          onSortEnd={this.onSortEnd}
        />
        {this.renderValidationErrors()}
      </div>
    )
  }

  renderAdvanced() {
    return (
      <div className={style.content}>
        <div>
          <label htmlFor="inputMaxRetries">Max number of retries</label>
          <input
            id="inputMaxRetries"
            type="number"
            name="quantity"
            min="0"
            max="1000"
            value={this.state.nbMaxRetries}
            onChange={this.onMaxRetriesChanged}
          />
        </div>

        <div>
          <label htmlFor="invalidOptionText">On invalid option, say:</label>
          <textarea
            id="invalidOptionText"
            value={this.state.invalidOptionValue}
            onChange={this.onInvalidOptionInputChanged}
          />
        </div>

        <div>
          <label htmlFor="nameQuestionBloc">Name of the question bloc:</label>
          <input
            id="nameQuestionBloc"
            type="text"
            value={this.state.nameOfQuestionBloc}
            onChange={this.onNameOfQuestionBlocChanged}
          />
        </div>

        <div>
          <label htmlFor="nameOfInvalidBloc">Name of the invalid bloc:</label>
          <input
            id="nameOfInvalidBloc"
            type="text"
            value={this.state.nameOfInvalidBloc}
            onChange={this.onNameOfInvalidBlocChanged}
          />
        </div>
      </div>
    )
  }

  render() {
    return (
      <Tabs defaultActiveKey={1} id="add-option-skill-tabs" animation={false}>
        <Tab eventKey={1} title="Basic">
          {this.renderBasic()}
        </Tab>
        <Tab eventKey={2} title="Advanced">
          {this.renderAdvanced()}
        </Tab>
      </Tabs>
    )
  }
}
