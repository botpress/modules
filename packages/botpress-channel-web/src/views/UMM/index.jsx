import { Component } from 'react'
import { 
  Button,
  Tooltip,
  OverlayTrigger,
  Glyphicon
} from 'react-bootstrap'

import _ from 'lodash'

import classnames from 'classnames'

import style from './style.scss'

export default class UMMComponent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    this.setState({
      loading: false
    })
  }

  componentWillUnmount() {
    this.setState({
      loading: true
    })
  }

  renderTyping() {
    if (!this.props.raw.typing) {
      return null
    }

    const classNames = classnames({
      [style.typing]: true,
      'bp-web-typing': true
    })

    const tooltip = <Tooltip id="tooltip">
      Typing for <strong>{this.props.raw.typing}</strong> milliseconds...
    </Tooltip>

    return <div className={classNames}>
      <OverlayTrigger placement="top" overlay={tooltip}>
        <Glyphicon glyph='pencil' />
      </OverlayTrigger>
    </div>
  }

  renderText() {
    const classNames = classnames({
      [style.text]: true, 
      'bp-web-text': true
    })
    
    if (this.state.typing) {
      return this.renderTyping()
    }

    return <div>
        <div className={classNames}>
          {this.props.text}
        </div>
        {this.renderForm()}
        {this.renderQuickReplies()}
      </div>
  }

  renderQuickRepliesButton({ title, payload }, key) {
    const tooltip = <Tooltip id="tooltip">
      On click, payload event <strong>{payload}</strong> is emitted.
    </Tooltip>

    return <OverlayTrigger key={key} placement="top" overlay={tooltip}>
      <Button >{title}</Button>
    </OverlayTrigger>
  }

  renderQuickReplies() {
    if (!this.props.raw.quick_replies) {
      return null
    }

    const classNames = classnames(style.quickReplies, 'bp-web-quick-replies')
    
    return <div className={classNames}>
        {this.props.raw.quick_replies.map(this.renderQuickRepliesButton)}
      </div>
  }
  renderFormInputs({ placeholder, name }, key) {
      const tooltip = <Tooltip id="tooltip">
        On click, payload event <strong>{name}</strong> is emitted.
      </Tooltip>

      return <OverlayTrigger key={key} placement="top" overlay={tooltip}>
        <Button >{placeholder}</Button>
      </OverlayTrigger>
  }
  renderForm() {
        if (!this.props.raw.form) {
            return null
        }

        const classNames = classnames(style.quickReplies, 'bp-web-quick-replies')

        return <div className={classNames}>
            {this.props.raw.form.map(this.renderFormInputs)}
        </div>
    }
  renderNotSupported() {
    return <div>Visual preview is not supported yet</div>
  }

  renderComponent() {
    switch (this.props.type) {
    case 'text':
      return this.renderText()
    default:
      return this.renderNotSupported()
    }   
  }

  render() {
    if (this.state.loading) {
      return null
    }

    const classNames = classnames(style.component, 'bp-web-component')
    return <div className={classNames}>
        {this.renderComponent()}
        {this.renderTyping()}
      </div>
  }
}