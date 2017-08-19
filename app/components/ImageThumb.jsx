// @flow
import React from 'react'
import { merge, evolve } from 'ramda'
import { Tab2, Tabs2, Button } from '@blueprintjs/core'

import {
  writeComment,
  sameValues,
  fixCustomData,
  pluralize
} from '../utils/helpers'
import TagsEditor from './TagsEditor'
import CustomFieldsEditor from './CustomFieldsEditor'

const updateSingleFile = (changes: any) => (file: any) => {
  const updatedData = changes && fixCustomData(evolve(changes, file.data))
  return writeComment(file, JSON.stringify(updatedData ? merge(file.data, updatedData) : {}))
}

export default ({files, updateCallback, itemsLen, ...props}: any) => {
  const submitCustomData = (changes?: {}, fileNames = null) => {
    const filteredFiles = files.filter(file => fileNames ? fileNames.includes(file.name) : file)
    Promise.all(filteredFiles.map(updateSingleFile(changes)))
      .then(() => updateCallback(filteredFiles, true))
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
        `Editing ${pluralize('item', itemsLen)}: ${files.map(v => v.name).join(', ')}`
      }</div>
      <div>
        <div className='mt-20'>
          <Tabs2 className='custom-tabs-panel' animate={false}>
            <Tab2 id='custom' title='Custom Data' panel={getPanel(getRawCustomDataForFiles())} />
            <Tab2 id='all' title='All Metadata' panel={getPanel(getRawDataForFiles())} />
          </Tabs2>
          <TagsEditor
            files={files}
            submitHandler={submitCustomData}
            allTags={props.allTags}
          />
          <CustomFieldsEditor
            files={files}
            allCustomFieldsKeys={props.allCustomFieldsKeys}
            submitHandler={submitCustomData}
          />
          <div className='center'>
            <Button
              className='pt-intent-danger mt-30'
              onClick={() => window.confirm('Are you sure?') && removeAllData()}
            >remove all data</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
