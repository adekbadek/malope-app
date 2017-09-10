// @flow
import React from 'react'
import { merge, pick, keys, take, without, append } from 'ramda'
import { Dialog, Button } from '@blueprintjs/core'

import { parseCSVFile, MOD, IMAGE_NAME_KEY } from '../utils/csv'
import { showWarning, showInfo } from './MainToaster'

class CSVDataChooser extends React.PureComponent {
  state = {
    imageNameColumn: this.props.columns[0],
    imageNameModifier: '',
    columnsForData: this.props.columns,
  }
  submit = (e) => {
    e && e.preventDefault()
    this.props.submitDataInfo(this.state)
  }
  setImageNameColumn = (e) => {
    this.setState({imageNameColumn: e.currentTarget.value})
  }
  setDataColumns = (e) => {
    const item = e.currentTarget
    const cols = this.state.columnsForData
    this.setState({columnsForData: item.checked ? append(item.name, cols) : without([item.name], cols)})
  }
  render () {
    const {columns, rows, fileName} = this.props
    return (
      <div className='flex__1'>
        <div className='mtb-10'>File: &nbsp;&nbsp;<code>{fileName}</code></div>
        <form onSubmit={this.submit}>
          <div className='pt-form-group mt-20'>
            <label className='pt-label'>
            1. Select the column which contains image filenames:
            </label>
            <div className='pt-form-content mt-10'>
              <div className='pt-select'>
                <select onChange={this.setImageNameColumn} value={this.state.imageNameColumn}>
                  {columns.map((col, i) => (
                    <option key={i} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className='mt-10 pt-text-muted'>
              <input
                type='text'
                placeholder={`use ${MOD} as placeholder`}
                className='pt-input'
                value={this.state.imageNameModifier}
                onChange={(e) => this.setState({imageNameModifier: e.target.value})}
              />
              <div className='mt-5'>
                i.e.: {rows.map((row, i) => {
                  const value = row[this.state.imageNameColumn]
                  const mod = this.state.imageNameModifier
                  return (
                    <code key={i} className='m-5'>
                      {mod.length > 0 ? mod.replace(MOD, value) : value}
                    </code>
                  )
                })}
              </div>
            </div>
          </div>

          <div className='pt-form-group mt-20'>
            <label className='pt-label'>
            2. Select the columns to be included in image metadata:
            </label>
            <div className='pt-form-content mt-10'>
              {columns.map((col, i) => (
                <label key={i} className='pt-control pt-checkbox'>
                  <input
                    type='checkbox'
                    name={col}
                    checked={this.state.columnsForData.includes(col)}
                    onChange={this.setDataColumns}
                  />
                  <span className='pt-control-indicator' />
                  {col}
                </label>
              ))}
            </div>
          </div>

          <Button onClick={this.submit} className='pt-intent-success'>Submit</Button>
        </form>
      </div>
    )
  }
}

export default class CSVImporter extends React.PureComponent {
  state = {
    delimiter: ';',
    fileName: '',
    columns: [],
    rows: [],
  }
  handleCSVFile = (file: {path: string, name: string}) => {
    parseCSVFile(file.path, this.state.delimiter)
      .then(table => {
        showInfo(`Imported table with ${table.length} rows`, 3000)
        this.setState({
          fileName: file.name,
          columns: keys(table[0]),
          rows: table,
        })
      })
      .catch(showWarning)
  }
  submitCSVFile = (e: any) => {
    this.handleCSVFile(e.currentTarget.files[0])
  }
  render () {
    return (
      <Dialog
        className='pt-dark'
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        title='Import CSV'
      >
        <div className='p-20'>
          <div className='pt-label flex flex--center-h'>
            <span className='mr-10'>Delimiter:</span>
            <input type='text' style={{width: '30px'}} className='pt-input mr-10' value={this.state.delimiter} onChange={(e) => this.setState({delimiter: e.currentTarget.value})} />
            <label className='pt-file-upload'>
              <input type='file' onChange={this.submitCSVFile} onClick={e => { e.target.value = null }} />
              <span className='pt-file-upload-input'>Choose CSV</span>
            </label>
          </div>
          <div className='mt-20'>
            {this.state.columns.length > 1
              ? <CSVDataChooser
                columns={this.state.columns}
                rows={take(5, this.state.rows)}
                fileName={this.state.fileName}
                submitDataInfo={info => {
                  this.props.submit(
                    info.imageNameModifier,
                    this.state.rows.map(row => merge(pick(info.columnsForData, row), {[IMAGE_NAME_KEY]: row[info.imageNameColumn]})),
                  )
                }}
              />
              : <div className='mb-10 pt-callout pt-intent-primary'>
                  Add a file using the button above 👆 <br /><br /> The delimiter is usually <code>;</code>, but sometimes a <code>,</code> is used.
              </div>
            }
          </div>
        </div>
      </Dialog>
    )
  }
}
