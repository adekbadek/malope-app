import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'ramda'

import { EXIF_TAG_NAME, normalizePath, jsonParse } from '../utils/helpers'
import styles from './Home.sass'

export default props => {
  const { selected, selecting, image, ...passedProps } = props

  const rawCustomData = image.metadata[EXIF_TAG_NAME]
  const customData = rawCustomData && jsonParse(rawCustomData)

  return (
    <div
      className={cx('flex--inline pt-card', styles.imageTile, {
        [styles.imageTileSelected]: selected,
        [styles.imageTileSelecting]: selecting,
      })}
      {...passedProps}
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
