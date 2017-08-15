// @flow
import React from 'react'
import { merge, evolve } from 'ramda'
import cx from 'classnames'

import styles from './Home.sass'
import {
  writeComment,
  sameValues,
  fixCustomData
} from '../utils/helpers'
import Button from './Button'
import TagsEditor from './TagsEditor'

const updateSingleFile = (changes: any) => (file: any) => {
  const updatedData = changes && fixCustomData(evolve(changes, file.data))
  return writeComment(file, JSON.stringify(updatedData ? merge(file.data, updatedData) : {}))
}

export default ({files, updateCallback, allTags, itemsLen}: any) => {
  const submitCustomData = (changes?: {}) => {
    Promise.all(files.map(updateSingleFile(changes)))
      .then(() => updateCallback(files, true))
  }

  const getRawCustomDataForFiles = () => files.map(v => v.data)

  const removeAllData = () => submitCustomData()

  return (
    <div className={cx('mt-20', styles.imageThumb)}>
      <div>{
        `Editing ${itemsLen} item${itemsLen === 1 ? '' : 's'}: ${files.map(v => v.name).join(', ')}`
      }</div>
      <div>
        <div className='mt-20'>
          {sameValues(getRawCustomDataForFiles())
            ? <pre className='mb-10'>{JSON.stringify(files[0].data)}</pre>
            : <div className='mb-10 pt-callout pt-intent-warning'>
              Data differs between selected files.
            </div>
          }
          <TagsEditor
            files={files}
            submitHandler={submitCustomData}
            allTags={allTags}
          />
          <Button
            className='pt-intent-danger mt-20'
            onClick={removeAllData}
          >remove all data</Button>
        </div>
      </div>
    </div>
  )
}
