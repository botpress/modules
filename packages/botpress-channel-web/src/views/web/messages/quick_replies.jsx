import React, { Component } from 'react'

import { hexToRGBA } from './misc'

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
    console.log(hexToRGBA)
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

export default QuickReplies
