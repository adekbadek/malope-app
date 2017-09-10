// @flow
import React from 'react'

const MAX = 3

export default ({names}: {names: Array<string>}) =>
  <span>
    {names.slice(0, MAX).join(', ')}
    {names.length > MAX && (
      <span> and {names.length - MAX} more</span>
    )}
  </span>
