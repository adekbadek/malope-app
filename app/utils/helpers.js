// @flow
import hasha from 'hasha'
import exiftool from 'node-exiftool'
import {
  find,
  update,
  append,
  uniq,
  evolve,
  keys,
  values,
  zip,
  compose,
  merge,
  assoc,
  dissoc,
  findIndex
} from 'ramda'

import { MOD, IMAGE_NAME_KEY } from '../utils/csv'

import type { Image } from '../utils/types'

export const mapObjectToPairs = (obj: {}) => {
  return zip(keys(obj), values(obj)).map(v => ({key: v[0], val: v[1]}))
}

export const hashString = (str: string) => hasha(str, {algorithm: 'md5'})

export const EXIF_TAG_NAME = 'UserComment'

// NOTE: exiftool must be installed globally for prod to work. dist-exiftool is not working.
const EXIFToolProcess = new exiftool.ExiftoolProcess('/usr/local/bin/exiftool')

export const readImageMetadata = (imagePath: string) => new Promise((resolve, reject) => {
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

export const writeComment = ({path}: {path: string}, comment: string) => EXIFToolProcess.writeMetadata(path, {
  all: '',
  [EXIF_TAG_NAME]: comment,
}, ['overwrite_original', 'codedcharacterset=utf8'])

export const normalizePath = (path: string) => path.replace(/ /g, '\\ ')

export const jsonParse = (str: string) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return null
  }
}

export const sameValues = (arr: Array<{}>) => arr.every(v => JSON.stringify(v) === JSON.stringify(arr[0]))

export const getRawCustomData = (image: Image): string => (
  (image.metadata && image.metadata[EXIF_TAG_NAME]) || JSON.stringify({})
)

export const parseCustomData = compose(jsonParse, getRawCustomData)

const CUSTOM_DATA_TEMPLATE = {
  tags: [],
  fields: {},
}
const CUSTOM_DATA_FIX = {
  tags: tags => uniq(tags)
}
const fixCustomData = (data: {}) => evolve(CUSTOM_DATA_FIX, data)
export const updateSingleFile = (changes: any) => (file: any) => {
  const updatedData = changes && fixCustomData(evolve(changes, file.data))
  return writeComment(file, JSON.stringify(updatedData ? merge(file.data, updatedData) : {}))
}

export const prepareFiles = (files: Array<any>) => {
  const createData = file => merge(CUSTOM_DATA_TEMPLATE, parseCustomData(file))
  return files.map(file => assoc('data', createData(file), file))
}

export const bgImgStyle = (path: string) => ({backgroundImage: `url(${normalizePath(path)})`})

// TODO: refactor to avoid reducing twice?
// TODO: test
export const FILENAMES_SEPARATOR = ', '
export const groupFieldsData = (files: any) => {
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
    .map(val => assoc('names', val.names.split(FILENAMES_SEPARATOR), val))
}

export const pluralize = (str: string, items: Array<any> | number) => {
  const len = typeof items === 'number' ? items : items.length
  return `${len} ${str}${len > 1 ? 's' : ''}`
}

export const assignTableDataToImages = (images: Array<Image>, imageNameModifier: string, table: Array<{}>) => new Promise((resolve, reject) => {
  let updatedFiles = []
  const proms = table.map(row => {
    const imageName = imageNameModifier.replace(MOD, row[IMAGE_NAME_KEY])
    const foundImage = images.find(v => v.name === imageName)
    if (foundImage) {
      updatedFiles = append(foundImage, updatedFiles)
      return updateSingleFile({
        fields: fields => merge(fields, dissoc(IMAGE_NAME_KEY, row))
      })(foundImage)
    }
  })
  Promise.all(proms)
    .then(() => resolve(updatedFiles))
    .catch(reject)
})

export const shiftSelectedIds = (imageIds: Array<string>, images: Array<Image>, forward: boolean) => {
  const lastOne = images.length - 1
  return imageIds.map(imageId => {
    const index = findIndex(v => v.id === imageId, images)
    if (forward) {
      return images[index === lastOne ? 0 : index + 1].id
    } else {
      return images[index === 0 ? lastOne : index - 1].id
    }
  })
}

export const handleFiltering = (images: Array<Image>, filters: Array<string>) => {
  return images
    .filter(image => (
      filters.every(filterValue => {
        const firstChar = filterValue[0]
        if (
          filterValue.length === 1 &&
          (firstChar === '#' ||
          firstChar === '!')
        ) {
          return true
        }
        let passed
        let negate = false
        if (filterValue.indexOf('!') === 0) {
          filterValue = filterValue.replace(/^!/, '')
          negate = true
        }
        if (filterValue.indexOf('#') === 0) {
          passed = image.data.tags.includes(filterValue.replace(/^#/, ''))
        } else {
          passed = image.name.indexOf(filterValue) >= 0
        }
        return negate ? !passed : passed
      })
    ))
}

export const createTableFromObject = (obj: {}) => {
  const inside = keys(obj).reduce((str, key) => (
    `<tr><td>${key}</td><td>${obj[key]}</td></tr>${str}`
  ), '')
  return `<table><tbody>${inside}</tbody></table>`
}
