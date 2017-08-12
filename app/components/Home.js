// @flow
import React, { Component } from 'react'
import { pick, path, merge } from 'ramda'

import { hashString, readImageMetadata } from '../utils/helpers'
import styles from './Home.sass'
import SelectableImagesList from './SelectableImagesList'

export default class Home extends Component {
  state = {
    images: [],
    selectedItems: [],
  }
  submitFile = (e: SyntheticEvent) => {
    const fileList = e.currentTarget.files
    const images = [].slice.call(fileList).map(file => pick(['path', 'name'], file))
    this.updateImages(images)
  }
  updateImages = (images: any = this.state.images) => {
    Promise.all(
      images.map(image => readImageMetadata(image.path))
    )
      .then(metadata => {
        this.setState({images: images.map((image, i) => (
          merge(image, {metadata: metadata[i], id: hashString(image.path)})
        ))})
      })
  }
  handleSelectionFinish = (selectedItems: any) => {
    this.setState({selectedItems})
  }
  render () {
    const itemsLen = this.state.selectedItems.length
    return (
      <div className='ph3 ph5-ns'>
        <div className={styles.container}>
          <h2>Image Tagger</h2>
          <form>
            <input multiple type='file' onChange={this.submitFile} />
          </form>
          <div className='mt3 flex'>
            <div className='flex__1'>
              <SelectableImagesList
                images={this.state.images}
                onSelectionFinish={this.handleSelectionFinish}
              />
            </div>
            <div className='flex__1'>
              <div>{itemsLen > 0 && `Editing ${itemsLen} item${itemsLen === 1 ? '' : 's'}`}</div>
              editing data here
            </div>
          </div>
        </div>
      </div>
    )
  }
}
