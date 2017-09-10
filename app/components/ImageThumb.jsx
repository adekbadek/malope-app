// @flow
import React from 'react'
import cx from 'classnames'
import { Tab2, Tabs2, Button } from '@blueprintjs/core'

import {
  sameValues,
  pluralize,
  updateSingleFile
} from '../utils/helpers'
import TagsEditor from './TagsEditor'
import CustomFieldsEditor from './CustomFieldsEditor'
import homeStyles from './Home.sass'

export default class ImageThumb extends React.Component {
  state = {
    topOffset: 140,
  }
  componentDidMount () {
    const box = this.refs.main.getBoundingClientRect()
    this.setState({
      topOffset: box.top,
    })
  }
  submitCustomData = (changes?: {}, fileNames: any = null) => {
    const filteredFiles = this.props.files.filter(file => fileNames ? fileNames.includes(file.name) : file)
    Promise.all(filteredFiles.map(updateSingleFile(changes)))
      .then(() => this.props.updateCallback(filteredFiles, true))
  }

  getRawCustomDataForFiles = () => this.props.files.map(v => v.data)
  getRawDataForFiles = () => this.props.files.map(v => v.metadata)

  removeAllData = () => this.submitCustomData()

  getPanel = (data: any) => (
    sameValues(data)
      ? <pre className='mb-10'>{JSON.stringify(data[0])}</pre>
      : <div className='mtb-10 pt-callout pt-intent-warning'>
          Data differs between selected files.
      </div>
  )
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
        <div>{
          `Editing ${pluralize('item', itemsLen)}: ${files.map(v => v.name).join(', ')}`
        }</div>
        <div>
          <div className='mt-20'>
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
                className='pt-intent-danger mt-30'
                onClick={() => window.confirm('Are you sure?') && this.removeAllData()}
              >remove all data</Button>
            </div>
            <Tabs2 className={cx(homeStyles.editorSection, 'custom-tabs-panel mt-20 pt-10')} animate={false}>
              <Tab2 id='custom' title='Custom Data' panel={this.getPanel(this.getRawCustomDataForFiles())} />
              <Tab2 id='all' title='All Metadata' panel={this.getPanel(this.getRawDataForFiles())} />
            </Tabs2>
          </div>
        </div>
      </div>
    )
  }
}
