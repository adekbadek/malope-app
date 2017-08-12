import React from 'react'
import { SelectableGroup, SelectAll, DeselectAll } from 'react-selectable-fast'

import SelectableImage from './SelectableImage'

export default props =>
  <SelectableGroup
    onSelectionFinish={props.onSelectionFinish}
  >
    <div>
      <div>
        <button><SelectAll><span>Select all</span></SelectAll></button>
        <button><DeselectAll><span>Clear selection</span></DeselectAll></button>
      </div>
      {props.images.map(image => (
        <SelectableImage
          key={image.id}
          image={image}
        />
      ))}
    </div>
  </SelectableGroup>
