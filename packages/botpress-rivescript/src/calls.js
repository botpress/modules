import Promise from 'bluebird'

function wait(rs, [ms]) {
  return Promise.delay('', ms)
}

module.exports = (rs) => {
  rs.setSubroutine('wait', wait)
}
