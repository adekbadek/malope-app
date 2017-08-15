import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'ramda'
import { createSelectable } from 'react-selectable-fast'

import { EXIF_TAG_NAME, normalizePath, jsonParse } from '../utils/helpers'
import styles from './Home.sass'

const SelectableImage = props => {
  const rawCustomData = props.image.metadata[EXIF_TAG_NAME]
  const customData = rawCustomData && jsonParse(rawCustomData)
  const { selectableRef, selected, selecting, image } = props

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
          {customData && customData.tags && !isEmpty(customData.tags) && <span className='pt-ui-text pt-icon-tag' />}
        </div>
      </div>
    </div>
  )
}

export default createSelectable(SelectableImage)
