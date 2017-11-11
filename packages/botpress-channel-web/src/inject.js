const injectDOMElement = (tagName, targetSelector, options = {}) => {
  let element = document.createElement(tagName)
  Object.keys(options).forEach(key => element[key] = options[key])
  document.querySelector(targetSelector).appendChild(element)
  return element
}

const hostName = window.botpressSettings && window.botpressSettings.hostname
const host = hostName ? `https://${hostName}` : ''

window.addEventListener('message', ({ data }) => {
  if (!data || !data.type || data.type !== 'setClass') return
  document.querySelector('#bp-widget').setAttribute('class', data.value)
})

if (!document.querySelector('#bp-web-widget')) {
  const styleHref = `${host}/api/botpress-platform-webchat/inject.css`
  const iframeHTML = `<iframe id='bp-widget'
                              src='${host}/lite/?m=platform-webchat&v=embedded' />`

  injectDOMElement('link', 'head', { type: 'text/css', rel: 'stylesheet', href: styleHref })
  injectDOMElement('div', 'body', { id: 'bp-web-widget', innerHTML: iframeHTML })

  const iframeWindow = document.querySelector('#bp-web-widget > #bp-widget').contentWindow
  const injectionScript = document.querySelector('#botpress-platform-webchat-injection')
  const { optionsJson } = injectionScript ? injectionScript.dataset : { optionsJson: '{}' }
  iframeWindow.botpressChatOptions = Object.assign({}, JSON.parse(optionsJson))

  window.botpressChat = (action) => iframeWindow.postMessage(action, '*')
}
