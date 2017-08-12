// @flow
import storage from 'electron-json-storage'

const FILES_KEY = 'file-list'
export const saveFileList = (fileList: any) => new Promise((resolve, reject) => {
  storage.set(FILES_KEY, fileList, (err) => {
    err ? reject(err) : resolve()
  })
})
export const retrieveFileList = () => new Promise((resolve, reject) => {
  storage.get(FILES_KEY, (err, data) => {
    err ? reject(err) : resolve(data)
  })
})
