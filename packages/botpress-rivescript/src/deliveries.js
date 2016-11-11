import _ from 'lodash'

const jsDelivery = { 
  test: /^js: (.+)/i,
  name: 'javascript',
  handler: (match, rs, skin, event) => {
    const body = match[1]
    const fn = new Function('rs', 'skin', 'event', body)
    fn(rs, skin, event)
  }
}

module.exports = [jsDelivery]

// module.exports = {
//   list: null,
//   add: null,
//   remove: null
// }
