// @flow
import React from 'react'
import cx from 'classnames'

export default class Input extends React.PureComponent {
  state = {
    value: '',
  }
  submit = (e: any) => {
    e && e.preventDefault()
    this.props.onSubmit(this.state.value)
    this.setState({value: ''})
  }
  render () {
    return (
      <form onSubmit={this.submit}>
        <input
          onChange={e => this.setState({value: e.currentTarget.value})}
          value={this.state.value}
          type='text'
          className={cx('pt-input', this.props.className)}
          placeholder={this.props.placeholder}
        />
      </form>
    )
  }
}
