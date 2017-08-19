import React from 'react'
import cx from 'classnames'
import { prop, append, without } from 'ramda'
import Combokeys from 'combokeys'
import { Dialog, Button } from '@blueprintjs/core'

import styles from './Home.sass'
import SelectableImage from './SelectableImage'
import ImagePreview from './ImagePreview'

export default class SelectableImagesList extends React.Component {
  state = {
    previewedImage: null,
    multipleSelect: false,
    alternativeClick: false,
  }
  componentDidMount () {
    this.combokeys = new Combokeys(document.documentElement)
    this.combokeys.bind('shift', () => { this.setState({multipleSelect: true}) }, 'keydown')
    this.combokeys.bind('shift', () => { this.setState({multipleSelect: false}) }, 'keyup')
    this.combokeys.bind('alt', () => { this.setState({alternativeClick: true}) }, 'keydown')
    this.combokeys.bind('alt', () => { this.setState({alternativeClick: false}) }, 'keyup')
  }
  componentWillUnmount () {
    this.combokeys && this.combokeys.detach()
  }
  selectAll = () => this.props.handleSelection(this.props.images.map(prop('id')))
  deselectAll = () => this.props.handleSelection([])
  handlePreview = (image) => this.setState({previewedImage: image})
  handleDialogClose = () => this.setState({previewedImage: null})

  render () {
    const areManySelected = this.props.selectedImagesIds.length > 1
    const areAnySelected = this.props.selectedImagesIds.length > 0
    return (
      <div>
        <div>
          {this.props.images.length > 0 && <Button onClick={this.selectAll} className='mr-10'>Select all</Button>}
          {areAnySelected && <Button onClick={this.deselectAll}>Clear selection</Button>}
        </div>
        <div className={cx('mt-20', styles.imageContainer)}>
          {this.props.images.map(image => {
            const isSelected = this.props.selectedImagesIds.includes(image.id)
            return (
              <SelectableImage
                key={image.id}
                image={image}
                selected={isSelected}
                selecting={this.state.alternativeClick}
                onClick={() => {
                  if (this.state.alternativeClick) {
                    this.handlePreview(image)
                  } else {
                    let selection = isSelected && !areManySelected ? [] : [image.id]
                    if (this.state.multipleSelect) {
                      selection = isSelected ? without([image.id], this.props.selectedImagesIds) : append(image.id, this.props.selectedImagesIds)
                    }
                    this.props.handleSelection(selection)
                  }
                }}
              />
            )
          })}
        </div>
        <Dialog
          className='pt-dark'
          isOpen={!!this.state.previewedImage}
          onClose={this.handleDialogClose}
          title={this.state.previewedImage && this.state.previewedImage.name}
        >
          {this.state.previewedImage && <ImagePreview image={this.state.previewedImage} />}
        </Dialog>
      </div>
    )
  }
}
