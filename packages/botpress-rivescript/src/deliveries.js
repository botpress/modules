import _ from 'lodash'

const jsDelivery = {
  test: /^js: (.+)/i,
  name: 'javascript',
  handler: (match, rs, bp, event, send) => {
    const body = match[1]
    const fn = new Function('rs', 'bp', 'event', 'send', body)
    fn(rs, bp, event, send)
  }
}

module.exports = [jsDelivery]
