// @flow
import React, { Component } from 'react'
import { pick, assoc } from 'ramda'

import ImageThumb from './ImageThumb'
import { hashCode, readImageMetadata } from '../utils/helpers'
import styles from './Home.sass'

export default class Home extends Component {
  state = {
    images: [],
  }
  submitFile = (e: SyntheticEvent) => {
    const fileList = e.currentTarget.files
    const images = [].slice.call(fileList).map(file => pick(['path', 'name'], file))
    this.updateImages(images)
  }
  updateImages = (images) => {
    Promise.all(
      images.map(image => readImageMetadata(image.path))
    )
      .then(metadata => {
        this.setState({images: images.map((image, i) => assoc('metadata', metadata[i], image))})
      })
  }
  render () {
    return (
      <div className='ph3 ph5-ns'>
        <div className={styles.container}>
          <h2>Image Tagger</h2>
          <form>
            <input multiple type='file' onChange={this.submitFile} />
          </form>
          <div className='mt3'>
            {this.state.images.map(image => (
              <ImageThumb
                key={hashCode(image.path)}
                image={image}
                updateCallback={() => {
                  this.updateImages(this.state.images)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
}
