import React from 'react'
import cx from 'classnames'
import { prop, append, without } from 'ramda'
import Combokeys from 'combokeys'

import styles from './Home.sass'
import SelectableImage from './SelectableImage'
import Button from './Button'

export default class SelectableImagesList extends React.Component {
  state = {
    multipleSelect: false,
  }
  componentDidMount () {
    this.combokeys = new Combokeys(document.documentElement)
    this.combokeys.bind('shift', () => {
      this.setState({multipleSelect: true})
    }, 'keydown')
    this.combokeys.bind('shift', () => {
      this.setState({multipleSelect: false})
    }, 'keyup')
  }
  componentWillUnmount () {
    this.combokeys && this.combokeys.detach()
  }
  selectAll = () => {
    this.props.handleSelection(this.props.images.map(prop('id')))
  }
  deselectAll = () => {
    this.props.handleSelection([])
  }
  render () {
    return (
      <div>
        <div>
          {this.props.images.length > 0 && <Button onClick={this.selectAll} className='mr-10'>Select all</Button>}
          {this.props.selectedImagesIds.length > 0 && <Button onClick={this.deselectAll}>Clear selection</Button>}
        </div>
        <div className={cx('mt-20', styles.imageContainer)}>
          {this.props.images.map(image => {
            const isSelected = this.props.selectedImagesIds.includes(image.id)
            return (
              <SelectableImage
                key={image.id}
                image={image}
                selected={isSelected}
                onClick={() => {
                  let selection = [image.id]
                  if (this.state.multipleSelect) {
                    selection = isSelected ? without([image.id], this.props.selectedImagesIds) : append(image.id, this.props.selectedImagesIds)
                  }
                  this.props.handleSelection(selection)
                }}
              />
            )
          })}
        </div>
      </div>
    )
  }
}
