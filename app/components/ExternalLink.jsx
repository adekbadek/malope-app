// @flow

import React from 'react'

export default ({href, ...props}: any) =>
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault()
      require('electron').shell.openExternal(href)
    }}
    {...props}
  />
