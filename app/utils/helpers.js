import hasha from 'hasha'
import exiftool from 'node-exiftool'
import { find, update, append, uniq, evolve, keys, values, zip, compose, prop, merge, assoc } from 'ramda'

export const mapObjectToPairs = obj => {
  return zip(keys(obj), values(obj)).map(v => ({key: v[0], val: v[1]}))
}

export const hashString = str => hasha(str, {algorithm: 'md5'})

export const EXIF_TAG_NAME = 'UserComment'

// NOTE: exiftool must be installed globally for prod to work. dist-exiftool is not working.
const EXIFToolProcess = new exiftool.ExiftoolProcess('/usr/local/bin/exiftool')

export const readImageMetadata = imagePath => new Promise((resolve, reject) => {
  const onSuccess = result => result.data ? resolve(result.data[0]) : reject(result.error)

  if (EXIFToolProcess.isOpen) {
    EXIFToolProcess.readMetadata(imagePath, ['-File:all'])
      .then(onSuccess, reject)
  } else {
    EXIFToolProcess
      .open()
      .then(() => EXIFToolProcess.readMetadata(imagePath, ['-File:all']))
      .then(onSuccess, reject)
  }
})

const writeImageMetadata = (image, data) => EXIFToolProcess.writeMetadata(image.path, data)

export const writeComment = (image, comment) => writeImageMetadata(image, {
  all: '',
  [EXIF_TAG_NAME]: comment,
}, ['overwrite_original', 'codedcharacterset=utf8'])

export const normalizePath = path => path.replace(/ /g, '\\ ')

export const jsonParse = (str: string) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return null
  }
}

export const TAGS_JOIN = '|'

export const sameValues = (arr: Array<any>) => arr.every(v => JSON.stringify(v) === JSON.stringify(arr[0]))

export const getRawCustomData = (image: any) => (
  prop(EXIF_TAG_NAME, image.metadata) || JSON.stringify({})
)

export const parseCustomData = compose(jsonParse, getRawCustomData)

const CUSTOM_DATA_TEMPLATE = {
  tags: [],
  fields: {},
}
const CUSTOM_DATA_FIX = {
  tags: tags => uniq(tags)
}
export const prepareFiles = (files: Array<any>) => {
  const createData = file => merge(CUSTOM_DATA_TEMPLATE, parseCustomData(file))
  return files.map(file => assoc('data', createData(file), file))
}
export const fixCustomData = (data) => evolve(CUSTOM_DATA_FIX, data)

export const bgImgStyle = path => ({backgroundImage: `url(${normalizePath(path)})`})

// TODO: refactor to avoid reducing twice?
// TODO: test
export const FILENAMES_SEPARATOR = ', '
export const groupFieldsData = (files) => {
  // group the fields, so we get array of {names, fields} objects
  return files
    .map(file => mapObjectToPairs(file.data.fields).map(field => ({fields: {[field.key]: field.val}, names: file.name})))
    .reduce((acc, val) => acc.concat(val), [])
    .reduce((acc, val) => {
      // get unique fields
      const found = find(v => JSON.stringify(v.fields) === JSON.stringify(val.fields), acc)
      if (found) {
        return update(
          acc.indexOf(found),
          assoc('names', [val.names, found.names].join(FILENAMES_SEPARATOR), found),
          acc
        )
      } else {
        return append(val, acc)
      }
    }, [])
    .reduce((acc, val) => {
      // get unique filenames
      const found = find(v => v.names === val.names, acc)
      if (found) {
        return update(
          acc.indexOf(found),
          assoc('fields', merge(val.fields, found.fields), found),
          acc
        )
      } else {
        return append(val, acc)
      }
    }, [])
}

export const pluralize = (str, items) => {
  const len = items.length || items
  return `${len} ${str}${len > 1 ? 's' : ''}`
}
