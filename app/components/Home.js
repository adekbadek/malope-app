// @flow
import React from 'react'
import { ipcRenderer } from 'electron'
import { connect } from 'react-redux'
import cx from 'classnames'
import { sort, union, pick, merge, keys } from 'ramda'
import { Button } from '@blueprintjs/core'

import {
  hashString,
  prepareFiles,
  readImageMetadata,
  pluralize,
  assignTableDataToImages,
  handleFiltering,
} from '../utils/helpers'
import { saveFileList, retrieveFileList } from '../utils/storage'
import styles from './Home.sass'
import SelectableImagesList from './SelectableImagesList'
import DataEditor from './DataEditor'
import {
  showWarning,
  showInfo,
  showDownloadedUpdateInfo,
  downloadProgressInfo,
} from './MainToaster'
import CSVImporter from './CSVImporter'
import WPModal from './WPModal'
import TableView from './TableView'
import SearchField from './SearchField'

import type { Image, MainMessage } from '../utils/types'

const NoneSelectedPrompt = () =>
  <div>
    👈 &nbsp;&nbsp;Select files in the left panel.
    <ul>
      <li><code>Shift</code> + <code>click</code> to select multiple</li>
      <li><code>Alt</code> + <code>click</code> or <code>space</code> to show preview</li>
    </ul>
  </div>

const NoFilesPrompt = () =>
  <div>
    Choose files using the form above 👆
  </div>

class Home extends React.PureComponent {
  state = {
    images: [],
    showCSVImporter: false,
    showTableView: false,
    showWPModal: false,
    selectedImagesIds: [],
    filters: [],
  }
  componentDidMount () {
    ipcRenderer.on('main', (event, {type, payload}: MainMessage) => {
      if (payload.info) {
        if (type === 'update-info') {
          showInfo(payload.info)
        } else if (type === 'update-downloaded') {
          showDownloadedUpdateInfo(payload.info)
        } else if (type === 'update-progress') {
          downloadProgressInfo(parseInt(payload.info))
        }
      }
    })

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
  updateImages = (images: Array<any> = this.state.images, update: boolean = false) => {
    if (!update) {
      this.setState({selectedImagesIds: []})
    }
    const order = this.state.images.map(v => v.id)

    Promise.all(
      images.map(image => readImageMetadata(image.path))
    )
      .then(metadata => {
        const updatedImages = images.map((image, i) => (
          merge(image, {metadata: metadata[i], id: hashString(image.path)})
        ))
        const updatedIds = updatedImages.map(v => v.id)
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
    this.getFilteredImages().reduce((acc, image) => union(image.data.tags, acc), [])
  )
  getAllCustomFieldsKeys = (): Array<string> => (
    this.getFilteredImages().reduce((acc, image) => union(keys(image.data.fields), acc), [])
  )
  getImagesForEditing = (): Array<Image> => (
    this.getFilteredImages().filter(v => this.state.selectedImagesIds.includes(v.id))
  )
  submitCSVData = (imageNameModifier: string, table: Array<{}>) => {
    assignTableDataToImages(this.state.images, imageNameModifier, table)
      .then(files => {
        this.updateImages(files)
        this.closeCSVImporter()
      })
  }
  getFilteredImages = () => {
    if (this.state.filters.length === 0) {
      return this.state.images
    }
    return handleFiltering(this.state.images, this.state.filters)
  }
  closeCSVImporter = () => this.setState({showCSVImporter: false})
  closeWPModal = () => this.setState({showWPModal: false})
  closeTableView = () => this.setState({showTableView: false})
  render () {
    const selectedItemsLen = this.getImagesForEditing().length
    const filteredImages = this.getFilteredImages()
    const hasImages = filteredImages.length > 1
    return (
      <div className={cx('plr-20', this.props.themeName, styles.Main)}>
        <div className={cx('pt-5', styles.container)}>
          <div className='mt-20 flex flex--center-h flex--spread'>
            <h2 className='mt-10 dib'>Image Tagger</h2>
            <div className='mt-10 flex flex--center-h'>
              {hasImages && <Button onClick={() => this.setState({showCSVImporter: true})}>Import CSV</Button>}
              {hasImages && <Button className='ml-10' onClick={() => this.setState({showTableView: true})}>Data Table</Button>}
              <Button className='ml-10' onClick={() => this.setState({showWPModal: true})}>WordPress 😎</Button>
              <label className='pt-file-upload ml-10'>
                <input multiple type='file' onChange={this.submitFile} />
                <span className='pt-file-upload-input'>Choose images</span>
              </label>
            </div>
          </div>
          <div className='mt-40 flex'>
            <div className='w--50'>
              <SearchField
                onSearch={(filters) => {
                  this.setState({filters})
                }}
                filteredLen={filteredImages.length}
                allLen={this.state.images.length}
              />
              <SelectableImagesList
                images={filteredImages}
                selectedImagesIds={this.state.selectedImagesIds}
                handleSelection={this.handleSelection}
              />
            </div>
            <div className='w--50'>
              {selectedItemsLen > 0
                ? <DataEditor
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
        <WPModal
          isOpen={this.state.showWPModal}
          onClose={this.closeWPModal}
          images={this.getImagesForEditing()}
        />
        <TableView
          isOpen={this.state.showTableView}
          images={filteredImages.map(v => ({
            _FILENAME: v.name,
            _TAGS: v.data.tags.join(', '),
            ...v.data.fields,
          }))}
          onClose={this.closeTableView}
        />
      </div>
    )
  }
}

export default connect(state => ({
  themeName: state.layout.themeName,
}))(Home)
