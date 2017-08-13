// @flow
import React from 'react'
import { prop, path, merge } from 'ramda'
import cx from 'classnames'

import styles from './Home.sass'
import { EXIF_TAG_NAME, writeComment, jsonParse, sameValues } from '../utils/helpers'
import ObjectBuilder from './ObjectBuilder'
import TagsEditor from './TagsEditor'

const TAGS_JOIN = '|'

export default class ImageThumb extends React.Component {
  state = {
    customData: {},
  }
  componentWillReceiveProps (nextProps: any) {
    if (JSON.stringify(this.props.images) !== JSON.stringify(nextProps.images)) {
      if (nextProps.images.length > 0) {
        const data = prop(EXIF_TAG_NAME, nextProps.images[0].metadata)
        if (data) {
          jsonParse(data).then(customData => this.setState({customData}))
        } else {
          this.resetState()
        }
      } else {
        this.resetState()
      }
    }
  }
  resetState = () => this.setState({customData: {}})
  submitCustomData = (object: {}) => {
    const newCustomData = merge(this.state.customData, object)
    Promise.all(
      this.props.images.map(image => writeComment(image, JSON.stringify(newCustomData)))
    )
      .then(() => {
        this.props.updateCallback(this.props.images, true)
      })
  }
  getImagesCustomData = () => (
    this.props.images.map(path(['metadata', EXIF_TAG_NAME]))
  )
  getTags = () => {
    const tags = this.state.customData.tags
    return tags ? tags.split(TAGS_JOIN) : []
  }
  updateTags = (tagList: Array<any>) => {
    this.submitCustomData({tags: tagList.join(TAGS_JOIN)})
  }
  render () {
    const isAllSelectedCustomDataEqual = sameValues(this.getImagesCustomData())
    return (
      <div className={cx('mt-20', styles.imageThumb)}>
        <div className='center'>{this.props.images.map(v => v.name).join(', ')}</div>
        <div>
          <div className='mt-20'>
            {isAllSelectedCustomDataEqual
              ? <pre className='mb-10'>{JSON.stringify(this.state.customData)}</pre>
              : <div className='mb-10 pt-callout pt-intent-warning'>
                Data differs between selected files. Showing data for the first one.
              </div>
            }
            <ObjectBuilder
            <TagsEditor
              tags={this.getTags()}
              editHandler={this.updateTags}
            />
              onSubmit={this.submitCustomData}
              defaultObject={this.state.customData}
            />
          </div>
        </div>
      </div>
    )
  }
}
