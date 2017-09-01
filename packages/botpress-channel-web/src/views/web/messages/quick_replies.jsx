import React, { Component } from 'react'

import style from './style.scss'

class QuickReply extends Component {

  constructor(props) {
    super(props)
    this.state = { hover: false }
  }

  handleClick() {
    this.props.onQuickReplySend
      && this.props.onQuickReplySend(this.props.title, this.props.payload)
  }

  render() {
    const backgroundColor = this.state.hover
      ? hexToRGBA(this.props.fgColor, 0.07)
      : hexToRGBA(this.props.fgColor, 0)

    return <button
      className={style.bubble} 
      style={{ color: this.props.fgColor, backgroundColor }}
      onClick={::this.handleClick}
      onMouseOver={() => this.setState({ hover: true })}
      onMouseOut={() => this.setState({ hover: false })}>
        {this.props.title}
    </button>
  }
}

const QuickReplies = props => {
  if (!props.quick_replies) {
    return null
  }
  
  const quick_replies = props.quick_replies.map(qr => <QuickReply {...props} {...qr} />)

  return <div className={style.quickReplyContainer}>
    {quick_replies}
  </div>
}

function hexToRGBA(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default QuickReplies
