// @flow
import React from 'react'
import { prop, path, merge } from 'ramda'
import cx from 'classnames'

import styles from './Home.sass'
import { EXIF_TAG_NAME, writeComment, jsonParse, sameValues } from '../utils/helpers'
import TagsEditor from './TagsEditor'

const TAGS_JOIN = '|'

export default (props: any) => {
  const submitCustomData = (object: {}) => {
    const customData = jsonParse(getRawCustomData())
    if (customData) {
      const newCustomData = merge(customData, object)
      Promise.all(
        props.images.map(image => writeComment(image, JSON.stringify(newCustomData)))
      )
        .then(() => {
          props.updateCallback(props.images, true)
        })
    }
  }
  const getImagesCustomData = () => (
    props.images.map(path(['metadata', EXIF_TAG_NAME]))
  )
  const getRawCustomData = (index: number = 0) => (
    prop(EXIF_TAG_NAME, props.images[index].metadata)
  )
  const getTags = () => {
    const customData = jsonParse(getRawCustomData())
    const tags = customData && customData.tags
    return tags ? tags.split(TAGS_JOIN) : []
  }
  const updateTags = (tagList: Array<any>) => {
    submitCustomData({tags: tagList.join(TAGS_JOIN)})
  }

  return (
    <div className={cx('mt-20', styles.imageThumb)}>
      <div className='center'>{props.images.map(v => v.name).join(', ')}</div>
      <div>
        <div className='mt-20'>
          {sameValues(getImagesCustomData())
            ? <pre className='mb-10'>{getRawCustomData()}</pre>
            : <div className='mb-10 pt-callout pt-intent-warning'>
              Data differs between selected files. Showing data for the first one.
            </div>
          }
          <TagsEditor
            tags={getTags()}
            editHandler={updateTags}
          />
        </div>
      </div>
    </div>
  )
}
