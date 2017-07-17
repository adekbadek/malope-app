// @flow
import React from 'react'
import { assoc, omit } from 'ramda'

import { mapObjectToPairs } from '../utils/helpers'
import Button from './Button'
import Pair from './Pair'

export default class ObjectBuilder extends React.Component {
  state = {
    object: this.props.defaultObject || {},
  }
  render () {
    return (
      <div>
        {mapObjectToPairs(this.state.object).map(v => (
          <Pair
            editHandler={(key, val) => {
              this.setState(state => ({object: assoc(key, val, state.object)}))
            }}
            deleteHandler={(key) => {
              this.setState(state => ({object: omit([key], state.object)}))
            }}
            key={v.key}
            pair={v}
          />
        ))}
        <div className='mt2'>
          <div>
            <input type='text' ref='newKeyInput' />
            <Button
              onClick={() => {
                this.setState(
                  state => ({object: assoc(this.refs.newKeyInput.value, '', state.object)}),
                  () => { this.refs.newKeyInput.value = '' }
                )
              }}
            >add</Button>
          </div>
          <div className='mt2'>
            <Button
              onClick={() => this.props.onSubmit(this.state.object)}
            >save</Button>
            <Button
              onClick={() => this.props.onSubmit({})}
            >clear</Button>
          </div>
        </div>
      </div>
    )
  }
}
