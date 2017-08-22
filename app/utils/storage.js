// @flow
import storage from 'electron-json-storage'

const saveItem = (KEY: string) => (item: any) => new Promise((resolve, reject) => {
  storage.set(KEY, item, (err) => {
    err ? reject(err) : resolve()
  })
})
const retrieveItem = (KEY: string) => () => new Promise((resolve, reject) => {
  storage.get(KEY, (err, data) => {
    err ? reject(err) : resolve(data)
  })
})

const FILES_KEY = 'file-list'
export const saveFileList = saveItem(FILES_KEY)
export const retrieveFileList = retrieveItem(FILES_KEY)

