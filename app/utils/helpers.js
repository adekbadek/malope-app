import hasha from 'hasha'
import exiftool from 'node-exiftool'
import { keys, values, zip, compose, prop, evolve } from 'ramda'

export const mapObjectToPairs = obj => {
  return zip(keys(obj), values(obj)).map(v => ({key: v[0], val: v[1]}))
}

export const hashString = str => hasha(str, {algorithm: 'md5'})

export const EXIF_TAG_NAME = 'UserComment'

const EXIFToolProcess = new exiftool.ExiftoolProcess()
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

export const sameValues = (arr: Array<any>) => arr.every(v => v === arr[0])

export const getRawCustomData = (image: any) => (
  prop(EXIF_TAG_NAME, image.metadata)
)

export const parseCustomData = compose(jsonParse, getRawCustomData)
