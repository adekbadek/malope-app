// @flow
import React from 'react'
import cx from 'classnames'
import { pluck, union, pick, path, merge } from 'ramda'

import { hashString, readImageMetadata } from '../utils/helpers'
import { saveFileList, retrieveFileList } from '../utils/storage'
import styles from './Home.sass'
import SelectableImagesList from './SelectableImagesList'
import ImageThumb from './ImageThumb'
import { showWarning, showInfo } from './MainToaster'

export default class Home extends React.Component {
  state = {
    images: [],
    selectedImagesIds: [],
  }
  componentDidMount () {
    retrieveFileList().then(res => {
      res && res.images && this.updateImages(res.images)
    })
  }
  submitFile = (e: SyntheticEvent) => {
    const fileList = e.currentTarget.files
    if (fileList.length > 0) {
      const images = [].slice.call(fileList).map(file => pick(['path', 'name'], file))
      saveFileList({images})
      this.updateImages(images)
    }
  }
  updateImages = (images: any = this.state.images, update: boolean = false) => {
    Promise.all(
      images.map(image => readImageMetadata(image.path))
    )
      .then(metadata => {
        const updatedImages = images.map((image, i) => (
          merge(image, {metadata: metadata[i], id: hashString(image.path)})
        ))
        const updatedIds = pluck('id', updatedImages)
        const withoutUpdated = this.state.images.filter(v => !updatedIds.includes(v.id))
        this.setState(
          state => ({images: update ? union(updatedImages, withoutUpdated) : updatedImages}),
          () => {
            showInfo(`${update ? 'Updated' : 'Imported'} ${images.length} files`)
          }
        )
      })
      .catch(res => {
        console.log(res)
        showWarning(res)
      })
  }
  handleSelectionFinish = (selectedItems: any) => {
    this.setState({selectedImagesIds: selectedItems.map(path(['props', 'image', 'id']))})
  }
  render () {
    const itemsLen = this.state.selectedImagesIds.length
    return (
      <div className={cx('plr-20 pt-dark', styles.Main)}>
        <div className={cx('pt-5', styles.container)}>
          <div className='mt-20 flex flex--center-h flex--spread'>
            <h2 className='mt-10 dib'>Image Tagger</h2>
            <label className='pt-file-upload mt-10'>
              <input multiple type='file' onChange={this.submitFile} />
              <span className='pt-file-upload-input'>Choose files</span>
            </label>
          </div>
          <div className='mt-40 flex'>
            <div className='w--50'>
              <SelectableImagesList
                images={this.state.images}
                areAnySelected={this.state.selectedImagesIds.length > 0}
                onSelectionFinish={this.handleSelectionFinish}
              />
            </div>
            <div className='w--50'>
              {itemsLen > 0
                ? <div>
                  <div>{`Editing ${itemsLen} item${itemsLen === 1 ? '' : 's'}`}</div>
                  <ImageThumb
                    images={this.state.images.filter(v => this.state.selectedImagesIds.includes(v.id))}
                    updateCallback={this.updateImages}
                  />
                </div>
                : <div className='mb-10 pt-callout pt-intent-primary'>Select files in the left panel</div>}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
