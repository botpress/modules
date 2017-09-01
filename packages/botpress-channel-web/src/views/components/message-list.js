import React from 'react'
import ReactDOM from 'react-dom'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import ReactChatView from 'react-chatview'
import classnames from 'classnames'

import TypingIndicator from './typing-indicator'
import Message from './message'

import style from './style.scss'

class MessageList extends React.Component {

  componentDidUpdate() {
    const node = ReactDOM.findDOMNode(this.refs.lastMessage)
    node && node.scrollIntoView()
  }

  loadMoreHistory() {
    // FIXME: Load more messages on demand
  }

  render() {
    var typing = (this.props.typing) ? <TypingIndicator /> : null
    const className = classnames(style.messages, {
      [style.typing]: this.props.typing
    })

    if (this.props.showWelcome && !this.props.messages.length) {
      return <div className={style.list}>
        <div className={style.newConvo}>
          <div className={style.text}>Start a new conversation with your bot</div>
          <div className={style.sayHi} onClick={this.props.onInitiate}>Say Hi</div>
        </div>
      </div>
    }

    return <div className={style.list}>
        <ReactChatView 
            className={className}
            flipped={false}
            scrollLoadThreshold={50}
            ref='list'
            onInfiniteLoad={::this.loadMoreHistory}>
          {this.props.messages.map((message, index) => <Message key={index} message={message} ref='lastMessage'/> )}
        </ReactChatView>
        {typing}
    </div>
  }
}

module.exports = MessageList
