// @flow
import React, { Component } from 'react'
import { pick, assoc } from 'ramda'
import cx from 'classnames'

import { writeComment, normalizePath, mapObjectToPairs, hashCode, readImageMetadata } from '../utils/helpers'
import styles from './Home.sass'

class ImageThumb extends React.Component {
  submitComment = e => {
    e.preventDefault()
    writeComment(this.props.image, this.refs.commentTextArea.value)
      .then(this.props.updateCallback)
  }
  render () {
    return (
      <div className={cx('mt4', styles.imageThumb)}>
        <div className='center bt bb pv1'>{this.props.image.name}</div>
        <div className='flex'>
          <div className='dib pa2'>
            <div
              className={styles.imageThumbTile}
              style={{backgroundImage: `url(${normalizePath(this.props.image.path)})`}}
            />
          </div>
          <div className='dib pa2 flex__1'>
            <div className='mt2'>
              {mapObjectToPairs(this.props.image.metadata).map(v => (
                <div className='flex mt1' key={v.key}>
                  <div className='w-50 dib'>{v.key}</div>
                  <div className='w-50 dib'>{v.val}</div>
                </div>
              ))}
            </div>
            <div className='mt3'>
              <div>Comment</div>
              <form onSubmit={this.submitComment}>
                <textarea ref='commentTextArea' className='w-100 mt2' rows='5' />
                <input type='submit' value='Submit' />
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

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
