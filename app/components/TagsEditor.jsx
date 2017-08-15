// @flow
import React from 'react'
import cx from 'classnames'
import Autocomplete from 'react-autocomplete'
import { append, without, reduce, uniq } from 'ramda'
import { Tooltip } from '@blueprintjs/core'

import styles from './TagsEditor.sass'

const getFileData = (file: any) => ({name: file.name, id: file.id})

const getTags = (files: Array<any>) => {
  const rawTags = reduce((arr, file) => arr.concat(file.data.tags), [], files) || []
  return uniq(rawTags).map(tag => ({
    name: tag,
    files: files.filter(file => file.data.tags.includes(tag)).map(getFileData)
  }))
}

const matchStrToTerm = (str, value) => (
  str.toLowerCase().indexOf(value.toLowerCase()) !== -1
)

class NewTagInput extends React.Component {
  state = {
    value: '',
  }
  updateValue = (value) => {
    this.setState({value}, this.submit)
  }
  submit = (e, skipValidation = false) => {
    e && e.preventDefault()
    if (!this.validate()) {
      return
    }
    this.props.onSubmit(this.state.value)
    setTimeout(() => {
      this.setState({value: ''})
    }, 1)
  }
  validate = () => this.state.value.length > 0
  render () {
    return (
      <form onSubmit={this.submit}>
        <Autocomplete
          getItemValue={i => i}
          items={this.props.items}
          shouldItemRender={matchStrToTerm}
          inputProps={{
            className: 'pt-input mtb-5 mr-5 posr',
            placeholder: `add tag to ${this.props.filesLength} file${this.props.filesLength > 1 ? 's' : ''}`,
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
            <div className={cx(styles.tagOption, isHighlighted && styles.tagOptionActive)}>
              {item}
            </div>
          }
          value={this.state.value}
          onChange={e => this.setState({value: e.target.value})}
          onSelect={this.updateValue}
        />
      </form>
    )
  }
}

export default ({files, submitHandler, allTags}: any) => {
  const tags = getTags(files)

  return (
    <div>
      <h5 className='mt-20'>Tags:</h5>
      <div className='flex ptb-5'>
        {tags.map(tag => (
          <Tooltip
            key={tag.name}
            isDisabled={files.length <= 1}
            content={tag.files.map(v => v.name).join(', ')}
          >
            <span className='pt-tag pt-large pt-tag-removable mtb-5 mr-5'>
              {files.length > 1 && <span className={cx('mr-5 flex--center', styles.tagNum)}>
                {tag.files.length}
              </span>}
              {tag.name}
              <button
                className='pt-tag-remove'
                onClick={() => submitHandler({tags: without([tag.name])})}
              />
            </span>
          </Tooltip>
        ))}
        <NewTagInput
          items={allTags.filter(tag => !tags.map(v => v.name).includes(tag))}
          filesLength={files.length}
          onSubmit={name => submitHandler({tags: append(name)})}
        />
      </div>
    </div>
  )
}
