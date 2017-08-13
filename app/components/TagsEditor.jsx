// @flow
import React from 'react'
import { without, append } from 'ramda'

import Input from './Input'

export default (props: any) =>
  <div>
    <h5 className='mt-20'>Tags:</h5>
    <div className='flex ptb-5'>
      {props.tags.map((tag, i) => (
        <span key={i} className='pt-tag pt-large pt-tag-removable mtb-5 mr-5'>
          {tag}
          <button
            className='pt-tag-remove'
            onClick={() => props.editHandler(without([tag], props.tags))}
          />
        </span>
      ))}
      <Input
        className='mtb-5 mr-5'
        placeholder='new tag'
        onSubmit={newTag => props.editHandler(append(newTag, props.tags))}
      />
    </div>
  </div>
