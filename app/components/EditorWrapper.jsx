// @flow
import React from 'react'

export default ({title, children}: {title: string, children: any}) =>
  <div className='mb-10 p-15 pt-card'>
    <h5 className='mt-0 mb-15'>{title}</h5>
    {children}
  </div>
