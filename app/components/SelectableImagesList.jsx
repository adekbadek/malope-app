import React from 'react'
import cx from 'classnames'
import { SelectableGroup, SelectAll, DeselectAll } from 'react-selectable-fast'

import styles from './Home.sass'
import SelectableImage from './SelectableImage'
import Button from './Button'

export default props =>
  <SelectableGroup
    onSelectionFinish={props.onSelectionFinish}
  >
    <div>
      <div>
        {props.images.length > 0 && <Button className='mr-10'><SelectAll><span>Select all</span></SelectAll></Button>}
        {props.areAnySelected && <Button><DeselectAll><span>Clear selection</span></DeselectAll></Button>}
      </div>
      <div className={cx('mt-20', styles.imageContainer)}>
        {props.images.map(image => (
          <SelectableImage
            key={image.id}
            image={image}
          />
        ))}
      </div>
    </div>
  </SelectableGroup>
