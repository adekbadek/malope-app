// @flow
import React from 'react'
import cx from 'classnames'

export default (props: any) =>
  <a {...props} className={cx('pt-button', props.className)}>{props.children}</a>
