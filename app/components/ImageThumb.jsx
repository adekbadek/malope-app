// @flow
import React from 'react'
import { merge, evolve } from 'ramda'
import cx from 'classnames'
import { Tab2, Tabs2 } from '@blueprintjs/core'

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
  const getRawDataForFiles = () => files.map(v => v.metadata)

  const removeAllData = () => submitCustomData()

  const getPanel = (data) => (
    sameValues(data)
      ? <pre className='mb-10'>{JSON.stringify(data[0])}</pre>
      : <div className='mtb-10 pt-callout pt-intent-warning'>
          Data differs between selected files.
      </div>
  )

  return (
    <div className='mt-20'>
      <div>{
        `Editing ${itemsLen} item${itemsLen === 1 ? '' : 's'}: ${files.map(v => v.name).join(', ')}`
      }</div>
      <div>
        <div className='mt-20'>
          <Tabs2 className='custom-tabs-panel'>
            <Tab2 id='custom' title='Custom Data' panel={getPanel(getRawCustomDataForFiles())} />
            <Tab2 id='all' title='All Metadata' panel={getPanel(getRawDataForFiles())} />
          </Tabs2>
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
