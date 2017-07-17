// @flow
import React, { Component } from 'react'
import { pick, assoc } from 'ramda'

import { hashCode, readImageMetadata } from '../utils/helpers'
import styles from './Home.sass'

const ImageThumb = props =>
  <div className={styles.imageThumb}>
    <div className={styles.imageThumbName}>{props.image.name}</div>
    <pre>{JSON.stringify(props.image.metadata)}</pre>
    <div
      className={styles.imageThumbTile}
      style={{backgroundImage: `url(${props.image.path})`}}
    />
  </div>

export default class Home extends Component {
  state = {
    images: [],
  }
  submitFile = (e: SyntheticEvent) => {
    const fileList = e.currentTarget.files
    const images = [].slice.call(fileList).map(file => pick(['path', 'name'], file))
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
        <div className={styles.container} data-tid='container'>
          <h2>Image Tagger</h2>
          <form>
            <input multiple type='file' onChange={this.submitFile} />
          </form>
          <div className='mt3'>
            {this.state.images.map(image => (
              <ImageThumb
                key={hashCode(image.path)}
                image={image}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
}
