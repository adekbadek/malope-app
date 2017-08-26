// @flow
import React from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import { append, dissoc, sort, pluck, union, pick, merge, keys } from 'ramda'
import { Button } from '@blueprintjs/core'

import {
  hashString,
  prepareFiles,
  readImageMetadata,
  pluralize,
  updateSingleFile
} from '../utils/helpers'
import { saveFileList, retrieveFileList } from '../utils/storage'
import styles from './Home.sass'
import SelectableImagesList from './SelectableImagesList'
import ImageThumb from './ImageThumb'
import { showWarning, showInfo } from './MainToaster'
import CSVImporter from './CSVImporter'
import { MOD, IMAGE_NAME_KEY } from '../utils/csv'

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

class Home extends React.Component {
  state = {
    images: [],
    showCSVImporter: false,
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
    const order = pluck('id', this.state.images)

    Promise.all(
      images.map(image => readImageMetadata(image.path))
    )
      .then(metadata => {
        const updatedImages = images.map((image, i) => (
          merge(image, {metadata: metadata[i], id: hashString(image.path)})
        ))
        const updatedIds = pluck('id', updatedImages)
        const withoutUpdated = this.state.images.filter(v => !updatedIds.includes(v.id))

        let newImages = prepareFiles(update ? union(updatedImages, withoutUpdated) : updatedImages)
        if (update) {
          // fix ordering which was changed by union()
          newImages = sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id), newImages)
        }
        this.setState(
          state => ({images: newImages}),
          () => {
            showInfo(`${update ? 'Updated' : 'Imported'} ${pluralize('file', images)}`)
          }
        )
      })
      .catch(res => {
        console.log(res)
        showWarning(res)
      })
  }
  handleSelection = (selectedImagesIds: Array<string>): void => {
    this.setState({selectedImagesIds})
  }
  getAllTags = (): Array<string> => (
    this.state.images.reduce((acc, image) => union(image.data.tags, acc), [])
  )
  getAllCustomFieldsKeys = (): Array<string> => (
    this.state.images.reduce((acc, image) => union(keys(image.data.fields), acc), [])
  )
  getImagesForEditing = (): Array<any> => (
    this.state.images.filter(v => this.state.selectedImagesIds.includes(v.id))
  )
  submitCSVData = (imageNameModifier: string, table: Array<{}>) => {
    let updatedFiles = []
    const proms = table.map(row => {
      const imageName = imageNameModifier.replace(MOD, row[IMAGE_NAME_KEY])
      const foundImage = this.state.images.find(v => v.name === imageName)
      if (foundImage) {
        updatedFiles = append(foundImage, updatedFiles)
        return updateSingleFile({
          fields: fields => merge(fields, dissoc(IMAGE_NAME_KEY, row))
        })(foundImage)
      }
    })
    Promise.all(proms).then(() => {
      this.updateImages(updatedFiles)
      this.closeCSVImporter()
    })
  }
  closeCSVImporter = () => this.setState({showCSVImporter: false})
  render () {
    const selectedItemsLen = this.state.selectedImagesIds.length
    const hasImages = this.state.images.length > 1
    return (
      <div className={cx('plr-20', this.props.themeName, styles.Main)}>
        <div className={cx('pt-5', styles.container)}>
          <div className='mt-20 flex flex--center-h flex--spread'>
            <h2 className='mt-10 dib'>Image Tagger</h2>
            <div className='mt-10 flex flex--center-h'>
              {hasImages && <Button onClick={() => this.setState({showCSVImporter: true})}>Import CSV</Button>}
              <label className='pt-file-upload ml-10'>
                <input multiple type='file' onChange={this.submitFile} />
                <span className='pt-file-upload-input'>Choose images</span>
              </label>
            </div>
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
              {selectedItemsLen > 0
                ? <ImageThumb
                  itemsLen={selectedItemsLen}
                  files={this.getImagesForEditing()}
                  allTags={this.getAllTags()}
                  allCustomFieldsKeys={this.getAllCustomFieldsKeys()}
                  updateCallback={this.updateImages}
                />
                : <div className='mb-10 pt-callout pt-intent-primary'>
                  {hasImages ? <NoneSelectedPrompt /> : <NoFilesPrompt />}
                </div>}
            </div>
          </div>
        </div>
        <CSVImporter
          submit={this.submitCSVData}
          isOpen={this.state.showCSVImporter}
          onClose={this.closeCSVImporter}
        />
      </div>
    )
  }
}

export default connect(state => ({
  themeName: state.layout.themeName,
}))(Home)
