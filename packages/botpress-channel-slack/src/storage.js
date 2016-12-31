import _ from 'lodash'
import path from 'path'
import fs from 'fs'

const getFilePath = (bp, name) => {
  const {
    projectLocation,
    botfile: {
      modulesConfigDir
    }
  } = bp

  const fileName = name
    ? `botpress-slack-${name}.json`
    : 'botpress-slack.json'

  return path.join(
    projectLocation,
    modulesConfigDir,
    fileName
  )
}

const writeJsonFile = (filePath, data) =>
  fs.writeFileSync(filePath, JSON.stringify(data))

const readJsonFile = _.flow([
  fs.readFileSync,
  JSON.parse
])

const createSaveFn = filePath => data =>
  writeJsonFile(filePath, data)

const createLoadFn = (filePath, defaultData) => () => {
  if (!fs.existsSync(filePath)) {
    createSaveFn(filePath)(defaultData)
    return defaultData
  }

  return readJsonFile(filePath)
}

export default (bp, defaultData, name) => {
  const filePath = getFilePath(bp, name)

  return {
    save: createSaveFn(filePath),
    load: createLoadFn(filePath, defaultData)
  }
}
