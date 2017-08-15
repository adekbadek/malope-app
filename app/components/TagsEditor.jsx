// @flow
import React from 'react'
import cx from 'classnames'
import { append, without, reduce, uniq } from 'ramda'
import { Tooltip } from '@blueprintjs/core'

import Input from './Input'
import styles from './TagsEditor.sass'

const getFileData = (file: any) => ({name: file.name, id: file.id})

const getTags = (files: Array<any>) => {
  const rawTags = reduce((arr, file) => file.data.tags && arr.concat(file.data.tags), [], files) || []
  return uniq(rawTags).map(tag => ({
    name: tag,
    files: files.filter(file => file.data.tags.includes(tag)).map(getFileData)
  }))
}

export default (props: any) => {
  return (
    <div>
      <h5 className='mt-20'>Tags:</h5>
      <div className='flex ptb-5'>
        {getTags(props.files).map(tag => (
          <Tooltip
            key={tag.name}
            isDisabled={props.files.length <= 1}
            content={tag.files.map(v => v.name).join(', ')}
          >
            <span className='pt-tag pt-large pt-tag-removable mtb-5 mr-5'>
              {props.files.length > 1 && <span className={cx('mr-5 flex--center', styles.tagNum)}>
                {tag.files.length}
              </span>}
              {tag.name}
              <button
                className='pt-tag-remove'
                onClick={() => props.submitHandler({tags: without([tag.name])})}
              />
            </span>
          </Tooltip>
        ))}
        <Input
          className='mtb-5 mr-5'
          placeholder='new tag'
          onSubmit={name => props.submitHandler({tags: append(name)})}
        />
      </div>
    </div>
  )
}
