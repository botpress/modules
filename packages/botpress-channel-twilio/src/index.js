import twilio from 'twilio'
import qs from 'querystring'
import _ from 'lodash'
import bodyParser from 'body-parser'

import { extractNumber } from './util'
import UMM from './umm'

let client = null

module.exports = {

  config: {
    accountSID: { type: 'string', required: true, env: 'TWILIO_SID' },
    authToken: { type: 'string', required: true, env: 'TWILIO_TOKEN' },
    fromNumber: { type: 'string', required: false, env: 'TWILIO_FROM' },
    messagingServiceSid: { type: 'string', required: false, env: 'TWILIO_MESSAGING_SERVICE' }
  },

  init: async function(bp, configurator) {
    bp.middlewares.register({
      name: 'twilio.sendSms',
      type: 'outgoing',
      order: 100,
      handler: handleOutgoing,
      module: 'botpress-twilio',
      description: 'Sends out text messages by SMS using Twilio'
    })

    const {
      accountSID,
      authToken,
      fromNumber,
      messagingServiceSid
    } = await configurator.loadAll()

    client = new twilio(accountSID, authToken)

    function handleOutgoing(event, next) {
      if (event.platform !== 'twilio') {
        // Only process twilio messages
        return next()
      }

      client.messages.create({
        from: fromNumber,
        to: extractNumber(event),
        body: event.text
      })
      .then(() => {
        if (event._promise && event._resolve) {
          event._resolve()
        }
      })
    }

    UMM(bp)
  },

  ready: async function(bp, configurator) {

    let users = {}
    async function getOrCreateUser(fromNumber) {
      if (!users[fromNumber]) {
        users[fromNumber] = {
          first_name: 'Unknown',
          last_name: 'Unknown',
          profile_pic: null,
          id: fromNumber,
          platform: 'twilio',
          number: fromNumber
        }

        await bp.db.saveUser(users[fromNumber])
      }

      return users[fromNumber]
    }

    bp.twilio = { getOrCreateUser }

    const router = bp.getRouter('botpress-twilio', {
      'bodyParser.json': false,
      'auth': false,
      'bodyParser.urlencoded': false
    })

    router.use(bodyParser.urlencoded({
      extended: false
    }))

    const { authToken } = await configurator.loadAll()

    router.post('/webhook', async (req, res) => {
      
      const valid = twilio.validateExpressRequest(req, authToken, { protocol: 'https' })
      
      if (!valid) {
        return res.sendStatus(403)
      }

      const { 
        Body: message,
        From: fromNumber,
        FromCountry: fromCountry,
        FromCity: fromCity,
        FromState: fromState,
        SmsSid: smsSid,
        SmsMessageSid: messageSid,
        To: _toNumber,
        AccountSid: _accountSid
       } = req.body || {}

       const user = await getOrCreateUser(fromNumber)

       bp.middlewares.sendIncoming({
        platform: 'twilio',
        type: 'message',
        user: user,
        text: message,
        raw: { message, fromNumber, fromCountry, fromCity, fromState, smsSid, messageSid }
      })
    })
  }
}
