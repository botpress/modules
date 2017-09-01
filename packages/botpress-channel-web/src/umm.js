import util from 'util'
import _ from 'lodash'
import Promise from 'bluebird'


const QUICK_REPLY_PAYLOAD = /\<(.+)\>\s(.+)/i

// TODO Extract this logic directly to botpress's UMM
function processQuickReplies(qrs, blocName) {
  if (!_.isArray(qrs)) {
    throw new Error('Expected quick_replies to be an array')
  }

  return qrs.map(qr => {
    if (_.isString(qr) && QUICK_REPLY_PAYLOAD.test(qr)) {
      let [, payload, text] = QUICK_REPLY_PAYLOAD.exec(qr)
      
      // <.HELLO> becomes <BLOCNAME.HELLO>
      if (payload.startsWith('.')) {
        payload = blocName + payload
      }

      return {
        title: text,
        payload: payload.toUpperCase()
      }
    }

    return qr
  })
}

function getUserId(event) {
  const userId = _.get(event, 'user.id')
    || _.get(event, 'user.userId')
    || _.get(event, 'userId')
    || _.get(event, 'raw.from')
    || _.get(event, 'raw.userId')
    || _.get(event, 'raw.user.id')

  if (!userId) {
    throw new Error('Could not find userId in the incoming event.')
  }

  return userId
}

function PromisifyEvent(event) {
  if (!event._promise) {
    event._promise = new Promise((resolve, reject) => {
      event._resolve = resolve
      event._reject = reject
    })
  }

  return event
}

function processOutgoing({ event, blocName, instruction }) {
  const ins = Object.assign({}, instruction) // Create a shallow copy of the instruction

  ////////
  // PRE-PROCESSING
  ////////
  
  const optionsList = ['typing', 'quick_replies']

  const options = _.pick(instruction, optionsList)
  
  for (let prop of optionsList) {
    delete ins[prop]
  }

  if (options.quick_replies) {
    options.quick_replies = processQuickReplies(options.quick_replies, blocName)
  }

  /////////
  /// Processing
  /////////

  if (!_.isNil(instruction.text)) {
    const user = getUserId(event)

    const raw = Object.assign({
      to: user,
      message: instruction.text
    }, options, _.pick(event && event.raw, 'conversationId'))

    return PromisifyEvent({
      platform: 'web',
      type: 'text',
      user: { id: user },
      raw: raw,
      text: instruction.text
    })
  }

  ////////////
  /// POST-PROCESSING
  ////////////
  
  // Nothing to post-process yet

  ////////////
  /// INVALID INSTRUCTION
  ////////////

  const strRep = util.inspect(instruction, false, 1)
  throw new Error(`Unrecognized instruction on Web in bloc '${blocName}': ${strRep}`)

}

////////////
/// TEMPLATES
////////////

function getTemplates() {
  return [
    {
      type: 'Text - Single message',
      template: `block_name_sm:
  - Text goes here..`
    },{
      type: 'Text - Multiple messages',
      template: `block_name_mm:
  - Text goes here..(1)
  - Text goes here..(2)`
    },{
      type: 'Text - Random message',
      template: `block_name_rm:
  - text:
    - Text goes here..(1)
    - Text goes here..(2)`
    },{
      type: 'Typing - Message with typing',
      template: `block_name_bm:
  - text: Text goes here..(1)
    typing: 1000ms`
    }
  ]
}

module.exports = bp => {
  const [umm, registerConnector] = _.at(bp, ['umm', 'umm.registerConnector'])

  umm && registerConnector && registerConnector({
    platform: 'web',
    processOutgoing: args => processOutgoing(Object.assign({}, args, { bp })),
    templates: getTemplates()
  })
}
