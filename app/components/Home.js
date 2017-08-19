// @flow
import React from 'react'
import cx from 'classnames'
import { pluck, union, pick, merge } from 'ramda'

import { hashString, prepareFiles, readImageMetadata } from '../utils/helpers'
import { saveFileList, retrieveFileList } from '../utils/storage'
import styles from './Home.sass'
import SelectableImagesList from './SelectableImagesList'
import ImageThumb from './ImageThumb'
import { showWarning, showInfo } from './MainToaster'

const NoneSelectedPrompt = () =>
  <div>
    👈 &nbsp;&nbsp;Select files in the left panel.
    <ul>
      <li><code>Shift</code> + <code>click</code> to select multiple</li>
      <li><code>Alt</code> + <code>click</code> to show preview</li>
    </ul>
  </div>

const NoFilesPrompt = () =>
  <div>
    Choose files using the form above 👆
  </div>

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
  submitFile = (e: any) => {
    const fileList = e.currentTarget.files
    if (fileList.length > 0) {
      const images = [].slice.call(fileList).map(file => pick(['path', 'name'], file))
      saveFileList({images})
      this.updateImages(images)
    }
  }
  updateImages = (images: any = this.state.images, update: boolean = false) => {
    if (!update) {
      this.setState({selectedImagesIds: []})
    }
    Promise.all(
      images.map(image => readImageMetadata(image.path))
    )
      .then(metadata => {
        const updatedImages = images.map((image, i) => (
          merge(image, {metadata: metadata[i], id: hashString(image.path)})
        ))
        const updatedIds = pluck('id', updatedImages)
        const withoutUpdated = this.state.images.filter(v => !updatedIds.includes(v.id))

        const newImages = prepareFiles(update ? union(updatedImages, withoutUpdated) : updatedImages)
        this.setState(
          state => ({images: newImages}),
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
  handleSelection = (selectedImagesIds: Array<string>) => {
    this.setState({selectedImagesIds})
  }
  getAllTags = () => this.state.images.reduce((arr, image) => union(image.data.tags, arr), [])
  getImagesForEditing = () => (
    this.state.images.filter(v => this.state.selectedImagesIds.includes(v.id))
  )
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
                selectedImagesIds={this.state.selectedImagesIds}
                handleSelection={this.handleSelection}
              />
            </div>
            <div className='w--50'>
              {itemsLen > 0
                ? <ImageThumb
                  itemsLen={itemsLen}
                  files={this.getImagesForEditing()}
                  allTags={this.getAllTags()}
                  updateCallback={this.updateImages}
                />
                : <div className='mb-10 pt-callout pt-intent-primary'>
                  {this.state.images.length > 1 ? <NoneSelectedPrompt /> : <NoFilesPrompt />}
                </div>}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
