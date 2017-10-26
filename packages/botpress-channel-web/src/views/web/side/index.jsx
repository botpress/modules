import React from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
// import { Picker } from 'emoji-mart'

import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'

import Send from '../send'
import MessageList from '../messages'
import Input from '../input'

import BotAvatar from '../bot_avatar'

import style from './style.scss'
// require('emoji-mart/css/emoji-mart.css')

export default class Side extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      focused: false,
      showEmoji: false,
      showConvos: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.currentConversation && nextProps.currentConversation) {
      this.setState({ showConvos: false })
    }
  }

  handleFocus(value) {
    this.setState({
      focused: value
    })
  }

  handleEmojiClicked() {
    this.setState({
      showEmoji: !this.state.showEmoji
    })
  }

  handleToggleShowConvos() {
    this.setState({
      showConvos: !this.state.showConvos
    })
  }

  renderAvatar() {
    let content = <BotAvatar foregroundColor={this.props.config.foregroundColor} />

    if (this.props.config && this.props.config.botAvatarUrl) {
      content = <div 
        className={style.picture} 
        style={{ backgroundImage: 'url(' + this.props.config.botAvatarUrl +')'}}>
      </div>
    }

    return <div className={style.avatar} style={{ color: this.props.config.foregroundColor }}>
      {content}
    </div>
  }

  renderUnreadCount() {
    return <span className={style.unread}>{this.props.unreadCount}</span>
  }

  renderTitle() {
    const title  = (this.props.currentConversation && !this.state.showConvos)
      ? this.props.config.botConvoTitle
      : 'Conversations'

    const description = this.props.config.botConvoDescription
    const hasDescription = description && description.length > 0
    
    return <div className={style.title}>
        <div className={style.name}>{title}{this.props.unreadCount > 0 ? this.renderUnreadCount() : null}</div>
        {hasDescription && <div className={style.status}>{description}</div>}
      </div>
  }

  renderConvoButton() {
    return <span className={style.icon}>
        <i onClick={::this.handleToggleShowConvos}>
          <svg width="24" height="17" viewBox="0 0 24 17" xmlns="http://www.w3.org/2000/svg"><path d="M7 14.94h16c.552 0 1 .346 1 .772 0 .427-.448.773-1 .773H7c-.552 0-1-.346-1-.773 0-.426.448-.773 1-.773zM2.25 3.09H.75C.336 3.09 0 2.746 0 2.32V.773C0 .346.336 0 .75 0h1.5c.414 0 .75.346.75.773v1.545c0 .427-.336.773-.75.773zM2.25 10.303H.75c-.414 0-.75-.346-.75-.773V7.985c0-.427.336-.773.75-.773h1.5c.414 0 .75.346.75.773V9.53c0 .427-.336.773-.75.773zM2.25 17H.75c-.414 0-.75-.346-.75-.773v-1.545c0-.427.336-.773.75-.773h1.5c.414 0 .75.345.75.772v1.545c0 .427-.336.773-.75.773zM23 2.06H7c-.552 0-1-.346-1-.772 0-.427.448-.773 1-.773h16c.552 0 1 .346 1 .773 0 .426-.448.773-1 .773zM23 9.273H7c-.552 0-1-.346-1-.773 0-.427.448-.773 1-.773h16c.552 0 1 .346 1 .773 0 .427-.448.773-1 .773z"></path></svg>
        </i>
      </span>
  }

  renderCloseButton() {
    if (!this.props.onClose) {
      return null
    }
    
    return <span className={style.icon}>
        <i onClick={this.props.onClose}>
          <svg width="17" height="17" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg"><path d="M9.502 8.5l7.29 7.29c.277.278.277.727 0 1.003-.137.138-.32.207-.5.207s-.362-.07-.5-.207L8.5 9.503l-7.29 7.29c-.14.138-.32.207-.5.207-.183 0-.364-.07-.502-.207-.277-.276-.277-.725 0-1.002l7.29-7.29-7.29-7.29C-.07.932-.07.483.208.206c.277-.276.725-.276 1 0L8.5 7.497l7.29-7.29c.277-.276.725-.276 1.002 0 .277.277.277.726 0 1.002L9.502 8.5z" fill-rule="evenodd"></path></svg>
        </i>
      </span>
  }

  renderHeader() {
    const status = <div className={style.status}>
      <svg viewBox="0 0 10 10"><ellipse cx="50%" cy="50%" rx="50%" ry="50%"></ellipse></svg>
      <span>always online</span>
    </div>

    return <div className={style.header}>
        <div className={style.left}>
          <div className={style.line}>
            {this.renderAvatar()}
            {this.renderTitle()}
          </div>
        </div>
        {this.renderConvoButton()}
        {this.renderCloseButton()}
      </div>
  }

  renderAttachmentButton() {
    return null // Temporary removed this feature (not implemented yet)

    return <li>
        <a>
          <i>
            <svg width="18" height="17" viewBox="0 0 18 17" xmlns="http://www.w3.org/2000/svg"><path d="M8.455 16.5c-.19 0-.378-.076-.522-.226-.29-.303-.29-.792 0-1.093l7.66-8.013c.57-.597.885-1.392.885-2.236 0-.844-.315-1.638-.886-2.235-1.18-1.233-3.097-1.232-4.275 0L2.433 11.99c-.5.525-.742 1.03-.715 1.502.026.46.303.815.467.985.275.29.573.41.908.364.42-.054.903-.356 1.398-.874l6.973-7.295c.288-.3.755-.3 1.043 0 .29.303.29.793 0 1.093l-6.97 7.296c-.74.773-1.5 1.215-2.26 1.314-.797.104-1.535-.175-2.135-.804-.537-.562-.856-1.267-.896-1.985-.054-.933.332-1.836 1.144-2.686l8.885-9.297c1.754-1.836 4.61-1.836 6.363 0 .85.888 1.318 2.07 1.318 3.328s-.468 2.44-1.318 3.33l-7.66 8.014c-.143.15-.332.226-.52.226z" fill-rule="evenodd"></path></svg>
          </i>
        </a>
      </li>
  }

  renderEmojiButton() {
    return null // Temporary removed this feature (emoji-mart lib is too big)

    return <li>
        <a>
          <i onClick={::this.handleEmojiClicked}>
            <svg preserveAspectRatio='xMidYMid' width="18" height="18" viewBox="0 0 24 24"><path d="M12 24C5.38 24 0 18.62 0 12S5.38 0 12 0s12 5.38 12 12-5.38 12-12 12zm0-22C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-2.9 0-5.56-1.75-6.9-4.57-.24-.5-.03-1.1.47-1.33.5-.24 1.1-.03 1.33.47C7.9 16.67 9.86 18 12 18c2.15 0 4.1-1.3 5.1-3.43.23-.5.83-.7 1.33-.47.5.23.7.83.47 1.33C17.58 18.25 14.93 20 12 20zm4-8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-8 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path></svg>
          </i>
        </a>
      </li>
  }

  renderComposer() {
    const name = this.props.config.botName || 'Bot'

    return <div className={style.composer} 
      style={{
        borderColor: this.state.focused ? this.props.config.foregroundColor : null
      }}>
        <div className={style['flex-column']}>
          <Input placeholder={"Reply to " + name}
            send={this.props.onTextSend}
            change={this.props.onTextChanged}
            text={this.props.text}
            focused={::this.handleFocus}
            config={this.props.config}/>
          <div className={style.line}>
            <ul className={style.elements}>
              {this.renderAttachmentButton()}
              {this.renderEmojiButton()}
            </ul>
            <Send
              send={this.props.onTextSend}
              text={this.props.text}
              config={this.props.config} />
          </div>
          {this.renderEmojiPicker()}
        </div>
      </div>
  }

  renderEmojiPicker() {
    if (!this.state.showEmoji) {
      return null
    }

    return null // Temporary removed this feature (emoji-mart is too big)

    // return <div className={style.emoji}>
    //     <div className={style.inside}>
    //       <Picker
    //         onClick={this.props.addEmojiToText} 
    //         set='emojione'
    //         emojiSize={18}
    //         perLine={10}
    //         color={this.props.config.foregroundColor}/>
    //     </div>
    //   </div>
  }

  renderConversation() {
    const messagesProps = {
      typingUntil: this.props.currentConversation && this.props.currentConversation.typingUntil,
      messages: this.props.currentConversation && this.props.currentConversation.messages,
      fgColor: this.props.config && this.props.config.foregroundColor,
      textColor: this.props.config && this.props.config.textColorOnForeground,
      avatarUrl: this.props.config && this.props.config.botAvatarUrl,
      onQuickReplySend: this.props.onQuickReplySend,
      onFormSend: this.props.onFormSend,
      onFileUploadSend: this.props.onFileUploadSend,
      onLoginPromptSend: this.props.onLoginPromptSend
    }

    return <div className={style.conversation}>
        <MessageList {...messagesProps} />
        <div className={style.bottom}>
          {this.renderComposer()}
        </div>
      </div>
  }

  renderItemConvos(convo, key) {
    const title = convo.title || convo.message_author || 'Untitled Conversation'
    const date = distanceInWordsToNow(new Date(convo.message_sent_on || convo.created_on))
    const message = convo.message_text || '...'
    
    const onClick = () => {
      this.props.onSwitchConvo && this.props.onSwitchConvo(convo.id)
      
      this.setState({
        showConvos: false
      })
    }

    return <div className={style.item} key={key} onClick={onClick}>
        <div className={style.left}>
          {this.renderAvatar()}
        </div>
        <div className={style.right}>
          <div className={style.title}>
            <div className={style.name}>{title}</div>
            <div className={style.date}><span>{date}</span></div>
          </div>
          <div className={style.text}>{message}</div> 
        </div>
      </div>
  }

  renderListOfConvos() {
    return <div className={style.list}>
        {this.props.conversations.map(::this.renderItemConvos)}
      </div>
  }

  render() {
    const fullscreen = this.props.fullscreen ? 'fullscreen' : null
    const classNames = classnames(style.internal, style[fullscreen], style[this.props.transition])

    return <span className={style.external}>
      <div className={classNames}
        style={{ 
          backgroundColor: this.props.config.backgroundColor,
          color: this.props.config.textColorOnBackgound
        }}>
        {this.renderHeader()}
        {this.state.showConvos ? this.renderListOfConvos() : this.renderConversation()}
      </div>
    </span>
  }
}
