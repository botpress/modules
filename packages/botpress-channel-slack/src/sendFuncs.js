/**
 * This module export a send functions creator which transform
 * action creators to send functions
 *
 * for example:
 *
 * for given action creator:
 *
 *    text(message, channelId)
 *
 * it will generate a send function
 *
 *    sendText(message, channelId)
 */

import _ from 'lodash'
import * as actions from './actions'

export default send => _.reduce(
  actions,
  (acc, actionCreator, actionName) => ({
    ...acc,
    [_.camelCase(`send_${actionName}`)]: _.flow([actionCreator, send])
  }),
  {}
)
