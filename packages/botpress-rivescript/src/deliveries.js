import _ from 'lodash'

const jsDelivery = {
  test: /^js: (.+)/i,
  name: 'javascript',
  handler: (match, rs, bp, event) => {
    const body = match[1]
    const fn = new Function('rs', 'bp', 'event', body)
    fn(rs, bp, event)
  }
}

module.exports = [jsDelivery]
