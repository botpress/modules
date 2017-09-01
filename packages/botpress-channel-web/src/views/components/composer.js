import React from 'react';
import ReactDOM from 'react-dom';

import style from './style.scss'

class Composer extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      text: ''
    }
  }

 // FIXME: Disable file button when text is sent
 // FIXME: Hide file button if not supported
//  if (window.File && window.FileReader && window.FileList && window.Blob) {
//   // Great success! All the File APIs are supported.
// } else {
//   alert('The File APIs are not fully supported in this browser.');
// }
  render() {

    // FIXME: Upload picture button
    // const uploadInput = <input className={style.hidden} ref="file" type="file" onChange={this.onSelectedFile.bind(this)}/>
    // const uploadButton = <div onClick={this.selectFile.bind(this)}><img src="res/attach.png"/></div>

    const uploadInput = null
    const uploadButton = null
    
    return <form ref="form" className={style.composer} action="" onSubmit={this.onSubmit.bind(this)}>
      <input ref="text"
      placeholder="Enter your message here..."
      value={this.state.text}
      onChange={this.updateState.bind(this)}
      autoComplete="off"/>
      {uploadInput}
      {uploadButton}
    </form>
  }

  updateState(e) {
    this.setState({text: e.target.value});
  }

  clearInput() {
    this.setState({text: ''});
    ReactDOM.findDOMNode(this.refs.text).focus();
  }

  onSubmit(e) {

    var text = this.refs.text.value

    if (text.length > 0) {
      e.preventDefault()
      this.props.onSubmit(text)
      this.clearInput()
    }
  }

  selectFile() {
    this.refs.file.click()
  }

  onSelectedFile() {
    if (this.refs.file.value) {
      this.props.onUpload(this.refs.file.files)
    }
  }
}

module.exports = Composer
