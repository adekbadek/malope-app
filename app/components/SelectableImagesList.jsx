// @flow
import React from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import { find, last, prop, append, without } from 'ramda'
import Combokeys from 'combokeys'
import { Button } from '@blueprintjs/core'

import styles from './Home.sass'
import SelectableImage from './SelectableImage'
import ImagePreview from './ImagePreview'
import { shiftSelectedIds } from '../utils/helpers'

class SelectableImagesList extends React.PureComponent {
  state = {
    showThumb: true,
    previewedImage: null,
    multipleSelect: false,
    alternativeClick: false,
  }
  componentDidMount () {
    this.combokeys = new Combokeys(document.documentElement)
    this.combokeys && this.combokeys.bind('shift', () => { this.setState({multipleSelect: true}) }, 'keydown')
    this.combokeys && this.combokeys.bind('shift', () => { this.setState({multipleSelect: false}) }, 'keyup')
    this.combokeys && this.combokeys.bind('alt', () => { this.setState({alternativeClick: true}) }, 'keydown')
    this.combokeys && this.combokeys.bind('alt', () => { this.setState({alternativeClick: false}) }, 'keyup')
    this.combokeys && this.combokeys.bind('esc', this.handlePreviewClose, 'keydown')
    this.combokeys && this.combokeys.bind('space', (e) => {
      e.preventDefault()
      this.state.previewedImage ? this.handlePreviewClose() : this.previewLastSelected()
    }, 'keydown')
    this.combokeys && this.combokeys.bind(['down', 'right'], (e) => {
      e.preventDefault()
      this.props.handleSelection(
        shiftSelectedIds(this.props.selectedImagesIds, this.props.images, true)
      )
    }, 'keydown')
    this.combokeys && this.combokeys.bind(['up', 'left'], (e) => {
      e.preventDefault()
      this.props.handleSelection(
        shiftSelectedIds(this.props.selectedImagesIds, this.props.images, false)
      )
    }, 'keydown')
  }
  componentWillUnmount () {
    this.combokeys && this.combokeys.detach()
  }
  combokeys = null

  selectAll = () => this.props.handleSelection(this.props.images.map(prop('id')))
  deselectAll = () => this.props.handleSelection([])
  isSelected = (image) => this.props.selectedImagesIds.includes(image.id)

  handlePreview = (image) => this.setState({previewedImage: image})
  handlePreviewClose = () => this.setState({previewedImage: null})
  previewLastSelected = () => {
    if (this.props.selectedImagesIds.length > 0) {
      this.handlePreview(
        find(
          v => v.id === last(this.props.selectedImagesIds),
          this.props.images
        )
      )
    }
  }

  selectImage = (image) => {
    const isSelected = this.isSelected(image)
    const areManySelected = this.props.selectedImagesIds.length > 1
    let selection = isSelected && !areManySelected ? [] : [image.id]
    if (this.state.multipleSelect) {
      selection = isSelected ? without([image.id], this.props.selectedImagesIds) : append(image.id, this.props.selectedImagesIds)
    }
    this.props.handleSelection(selection)
  }

  toggleThumbnail = () => {
    this.setState(({showThumb}) => ({showThumb: !showThumb}))
  }

  render () {
    const disableDeselect = this.props.selectedImagesIds.length === 0
    const { previewedImage, showThumb } = this.state
    return (
      <div>
        <div>
          {previewedImage
            ? <Button onClick={this.handlePreviewClose}>Close preview</Button>
            : <span>
              {this.props.images.length > 0 && [
                <Button key='select' onClick={this.selectAll} className='mr-10'>Select all</Button>,
                <Button key='deselect' disabled={disableDeselect} className='mr-10' onClick={this.deselectAll}>Clear selection</Button>
              ]}
              {this.props.images.length > 0 && <Button
                onClick={this.toggleThumbnail}
              >{showThumb ? 'Hide' : 'Show'} thumbnails</Button>}
            </span>}
        </div>
        {previewedImage
          ? <ImagePreview image={previewedImage} />
          : <div className={cx('mt-20', styles.imageContainer)}>
            {this.props.images.map(image => (
              <SelectableImage
                showThumb={this.state.showThumb}
                key={image.id}
                image={image}
                selected={this.isSelected(image)}
                selecting={this.state.alternativeClick}
                onClick={() => {
                  if (this.state.alternativeClick) {
                    this.handlePreview(image)
                  } else {
                    this.selectImage(image)
                  }
                }}
              />
            ))}
          </div>}
      </div>
    )
  }
}

export default connect(state => ({
  themeName: state.layout.themeName,
}))(SelectableImagesList)
