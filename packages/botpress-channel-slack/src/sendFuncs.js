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
