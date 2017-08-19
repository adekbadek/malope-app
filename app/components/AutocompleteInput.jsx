// @flow
import React from 'react'
import cx from 'classnames'
import Autocomplete from 'react-autocomplete'

import homeStyles from './Home.sass'

const matchStrToTerm = (str, value) => (
  str.toLowerCase().indexOf(value.toLowerCase()) !== -1
)

export default ({placeholder, inputStyle, inputClassName, ...props}: any) =>
  <Autocomplete
    getItemValue={i => i}
    shouldItemRender={matchStrToTerm}
    inputProps={{
      className: cx('pt-input posr', inputClassName),
      ...inputStyle && {style: inputStyle},
      placeholder,
    }}
    menuStyle={{
      border: 'none',
      position: 'fixed',
      overflow: 'scroll',
      maxHeight: '140px',
      borderRadius: '2px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    }}
    renderItem={(item, isHighlighted) =>
      <div className={cx(homeStyles.autocompleteOption, isHighlighted && homeStyles.autocompleteOptionActive)}>
        {item}
      </div>
    }
    {...props}
  />
