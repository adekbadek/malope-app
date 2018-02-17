// @flow
import React from 'react'
import { Button } from '@blueprintjs/core'

import NamesList from './NamesList'
import TagsEditor from './TagsEditor'
import CustomFieldsEditor from './CustomFieldsEditor'
import {
  pluralize,
  updateSingleFile
} from '../utils/helpers'

export default class DataEditor extends React.PureComponent {
  state = {
    topOffset: 140,
  }
  componentDidMount () {
    const box = this.refs.main.getBoundingClientRect()
    this.setState({
      topOffset: box.top,
    })
  }
  submitCustomData = (changes?: {}, fileNames: Array<string> = []) => {
    const filteredFiles = this.props.files
      .filter(file => fileNames.length > 0 ? fileNames.includes(file.name) : file)
    Promise.all(filteredFiles.map(updateSingleFile(changes)))
      .then(() => this.props.updateCallback(filteredFiles, true))
  }

  removeAllData = () => this.submitCustomData()

  render () {
    const {files, itemsLen, ...props} = this.props
    return (
      <div
        className='mt-20 pb-20'
        ref='main'
        style={{
          overflow: 'scroll',
          maxHeight: `calc(100vh - ${this.state.topOffset}px)`
        }}
      >
        <div>
          {`Editing ${pluralize('item', itemsLen)}: `}
          <NamesList names={files.map(v => v.name)} />
        </div>
        <div>
          <div className='mt-20' style={{padding: '0 1px'}}>
            <TagsEditor
              files={files}
              submitHandler={this.submitCustomData}
              allTags={props.allTags}
            />
            <CustomFieldsEditor
              files={files}
              allCustomFieldsKeys={props.allCustomFieldsKeys}
              submitHandler={this.submitCustomData}
            />
            <div className='center'>
              <Button
                className='pt-intent-danger mt-20'
                onClick={() => window.confirm('Are you sure?') && this.removeAllData()}
              >remove all data</Button>
            </div>
            <div className='mt-20'>
              <details>
                <summary>Raw metadata:</summary>
                <pre className='mb-0'>{JSON.stringify(this.props.files.map(v => v.metadata), null, '  ')}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
