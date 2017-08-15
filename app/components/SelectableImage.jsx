import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'ramda'
import { createSelectable } from 'react-selectable-fast'

import { EXIF_TAG_NAME, normalizePath, jsonParse } from '../utils/helpers'
import styles from './Home.sass'

class SelectableImage extends React.Component {
  state = {
    hasCustomData: false,
  }
  componentDidMount () {
    this.updateCustomData(this.props)
  }
  componentWillReceiveProps (nextProps: any) {
    if (this.props.image.metadata !== nextProps.image.metadata) {
      this.updateCustomData(nextProps)
    }
  }
  updateCustomData = (props: any) => {
    const rawCustomData = props.image.metadata[EXIF_TAG_NAME]
    const customData = rawCustomData && jsonParse(rawCustomData)
    customData && this.setState({hasCustomData: !isEmpty(customData)})
  }
  render () {
    const { selectableRef, selected, selecting, image } = this.props
    return (
      <div
        ref={selectableRef}
        className={cx('flex--inline pt-card', styles.imageTile, {
          [styles.imageTileSelected]: selected,
          [styles.imageTileSelecting]: selecting,
        })}
      >
        <div
          className={styles.imageTileDisplay}
          style={{backgroundImage: `url(${normalizePath(image.path)})`}}
        />
        <div className={styles.imageTileInfo}>
          <div className={styles.imageTileInfoTitle}>
            {image.name}
          </div>
          <div>
            {this.state.hasCustomData && <span className='pt-ui-text pt-icon-info-sign' />}
          </div>
        </div>
      </div>
    )
  }
}

export default createSelectable(SelectableImage)
