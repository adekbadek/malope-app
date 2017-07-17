// @flow
import React from 'react'

import Button from './Button'

const PairElement = props =>
  <div className='w-50 dib'>
    {props.editHandler ? (
      <input
        type='text'
        className='w-90'
        defaultValue={props.text}
        onChange={(e) => {
          props.editHandler && props.editHandler(e.target.value)
        }}
      />
    ) : props.text}
  </div>

export default (props: {editHandler?: any, deleteHandler?: any, pair: {key: string, val: (string | number)}}) => {
  return (
    <div className='flex mt1' >
      <PairElement text={props.pair.key} />
      <PairElement editHandler={
        props.editHandler && ((value) => props.editHandler && props.editHandler(props.pair.key, value))
      } text={props.pair.val} />
      {props.deleteHandler && (
        <Button onClick={() => { props.deleteHandler && props.deleteHandler(props.pair.key) }}>x</Button>
      )}
    </div>
  )
}
