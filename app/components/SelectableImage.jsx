import React from 'react'
import cx from 'classnames'
import { createSelectable } from 'react-selectable-fast'

import { normalizePath } from '../utils/helpers'
import styles from './Home.sass'

const SelectableImage = ({ selectableRef, selected, selecting, ...props }) =>
  <div
    ref={selectableRef}
    className={cx('mr-5 mb-5 flex--inline', styles.imageTile, {
      [styles.imageTileSelected]: selected,
      [styles.imageTileSelecting]: selecting,
    })}
  >
    <div
      className={styles.imageTileDisplay}
      style={{backgroundImage: `url(${normalizePath(props.image.path)})`}}
    />
    <div className='p-5'>
      <span className={styles.imageTileInfoTitle}>
        {props.image.name}
      </span>
    </div>
  </div>

export default createSelectable(SelectableImage)