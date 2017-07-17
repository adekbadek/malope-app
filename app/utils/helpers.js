import exiftool from 'node-exiftool'
import { keys, values, zip } from 'ramda'

export const mapObjectToPairs = obj => {
  return zip(keys(obj), values(obj)).map(v => ({key: v[0], val: v[1]}))
}

export const hashCode = str => {
  return str.split('').reduce((prevHash, currVal) => ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0)
}

export const EXIF_TAG_NAME = 'UserComment'

const EXIFToolProcess = new exiftool.ExiftoolProcess()
export const readImageMetadata = imagePath => new Promise((resolve, reject) => {
  const onSuccess = result => {
    resolve(result.data[0])
  }
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
