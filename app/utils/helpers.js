import exiftool from 'node-exiftool'
import { compose, map, values } from 'ramda'

export const mapObject = compose(values, map)

export const hashCode = str => {
  return str.split('').reduce((prevHash, currVal) => ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0)
}

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
