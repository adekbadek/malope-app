// @flow
import React from 'react'
import { merge, assoc, evolve } from 'ramda'
import cx from 'classnames'

import styles from './Home.sass'
import {
  writeComment,
  sameValues,
  getRawCustomData,
  parseCustomData
} from '../utils/helpers'
import Button from './Button'
import TagsEditor from './TagsEditor'

const CUSTOM_DATA_TEMPLATE = {
  tags: [],
}

const prepareFiles = (files: Array<any>) => {
  const createData = file => merge(CUSTOM_DATA_TEMPLATE, parseCustomData(file))
  return files.map(file => assoc('data', createData(file), file))
}

const updateSingleFile = (changes: any) => (file: any) => {
  const updatedData = changes && evolve(changes, file.data)
  return writeComment(file, JSON.stringify(updatedData ? merge(file.data, updatedData) : {}))
}

export default (props: any) => {
  const files = prepareFiles(props.images)

  const submitCustomData = (changes?: {}) => {
    Promise.all(files.map(updateSingleFile(changes)))
      .then(() => props.updateCallback(props.images, true))
  }

  const getRawCustomDataForFiles = () => props.images.map(getRawCustomData)

  const removeAllData = () => submitCustomData()

  return (
    <div className={cx('mt-20', styles.imageThumb)}>
      <div className='center'>{files.map(v => v.name).join(', ')}</div>
      <div>
        <div className='mt-20'>
          {sameValues(getRawCustomDataForFiles())
            ? <pre className='mb-10'>{getRawCustomData(props.images[0])}</pre>
            : <div className='mb-10 pt-callout pt-intent-warning'>
              Data differs between selected files.
            </div>
          }
          <TagsEditor
            files={files}
            submitHandler={submitCustomData}
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
