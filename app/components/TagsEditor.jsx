// @flow
import React from 'react'
import cx from 'classnames'
import { append, without, reduce, uniq } from 'ramda'
import { Tooltip } from '@blueprintjs/core'

import AutocompleteInput from './AutocompleteInput'
import tagsEditorStyles from './TagsEditor.sass'
import homeStyles from './Home.sass'
import { pluralize } from '../utils/helpers'

const getFileData = (file: any) => ({name: file.name, id: file.id})

const getTags = (files: Array<any>) => {
  const rawTags = reduce((arr, file) => arr.concat(file.data.tags), [], files) || []
  return uniq(rawTags).map(tag => ({
    name: tag,
    files: files.filter(file => file.data.tags.includes(tag)).map(getFileData)
  }))
}

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
        <AutocompleteInput
          onSelect={this.updateValue}
          items={this.props.items}
          value={this.state.value}
          inputStyle={{height: '22px'}}
          inputClassName='mtb-5 mr-5'
          onChange={e => this.setState({value: e.target.value})}
          placeholder={`add tag to ${pluralize('file', this.props.filesLength)}`}
        />
      </form>
    )
  }
}

export default ({files, submitHandler, allTags}: any) => {
  const tags = getTags(files)

  return (
    <div className={homeStyles.editorSection}>
      <h5 className='mtb-15'>Tags:</h5>
      <div className='flex flex--center-h ptb-5'>
        {tags.map(tag => (
          <Tooltip
            key={tag.name}
            isDisabled={files.length <= 1}
            content={tag.files.map(v => v.name).join(', ')}
          >
            <span className='pt-tag pt-tag-removable mtb-5 mr-5'>
              {files.length > 1 && <span className={cx('mr-5 flex--center', tagsEditorStyles.tagNum)}>
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
