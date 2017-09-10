// @flow
import React from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import { findIndex, find, last, prop, append, without } from 'ramda'
import Combokeys from 'combokeys'
import { Button } from '@blueprintjs/core'

import styles from './Home.sass'
import SelectableImage from './SelectableImage'
import ImagePreview from './ImagePreview'

class SelectableImagesList extends React.Component {
  state = {
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
      this.shiftSelection(true)
    }, 'keydown')
    this.combokeys && this.combokeys.bind(['up', 'left'], (e) => {
      e.preventDefault()
      this.shiftSelection(false)
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
  shiftSelection = (forward: boolean) => {
    const images = this.props.images
    const lastOne = images.length - 1
    const shiftedSelectedImagesIds = this.props.selectedImagesIds
      .map(imageId => {
        const index = findIndex(v => v.id === imageId, images)
        if (forward) {
          return images[index === lastOne ? 0 : index + 1].id
        } else {
          return images[index === 0 ? lastOne : index - 1].id
        }
      })
    this.props.handleSelection(shiftedSelectedImagesIds)
  }

  render () {
    const areAnySelected = this.props.selectedImagesIds.length > 0
    return (
      <div>
        <div>
          {this.state.previewedImage
            ? <Button onClick={this.handlePreviewClose}>Close preview</Button>
            : <span>
              {this.props.images.length > 0 && <Button onClick={this.selectAll} className='mr-10'>Select all</Button>}
              {areAnySelected && <Button onClick={this.deselectAll}>Clear selection</Button>}
            </span>}
        </div>
        {this.state.previewedImage
          ? <ImagePreview image={this.state.previewedImage} />
          : <div className={cx('mt-20', styles.imageContainer)}>
            {this.props.images.map(image => {
              return (
                <SelectableImage
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
              )
            })}
          </div>}
      </div>
    )
  }
}

export default connect(state => ({
  themeName: state.layout.themeName,
}))(SelectableImagesList)
