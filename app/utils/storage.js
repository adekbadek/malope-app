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

const WP_KEY = 'wp-auth'
export const saveWPCreds = saveItem(WP_KEY)
export const retrieveWPCreds = retrieveItem(WP_KEY)

const AUTHKEY_KEY = 'authkey-key'
export const saveAuthkey = saveItem(AUTHKEY_KEY)
export const retrieveAuthkey = retrieveItem(AUTHKEY_KEY)
