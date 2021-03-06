// @flow
import React from 'react'
import { omit, merge } from 'ramda'
import { Button } from '@blueprintjs/core'

import AutocompleteInput from './AutocompleteInput'
import NamesList from './NamesList'
import EditorWrapper from './EditorWrapper'
import { pluralize, mapObjectToPairs, groupFieldsData } from '../utils/helpers'

const INITIAL_STATE = {
  fieldName: '',
  fieldValue: '',
}

class FieldEditor extends React.PureComponent {
  state = {
    value: this.props.field.val,
  }
  componentWillReceiveProps (nexProps) {
    if (nexProps.field.val !== this.state.value) {
      this.setState({value: nexProps.field.val})
    }
  }
  remove = () => {
    this.props.removeHandler(this.props.field.key, this.props.names)
  }
  edit = (e) => {
    e && e.preventDefault()
    this.props.editHandler({[this.props.field.key]: this.state.value}, this.props.names)
  }
  render () {
    const { field } = this.props
    return (
      <tr>
        <td><code>{field.key}</code></td>
        <td>
          <form className='flex flex--spread' onSubmit={this.edit}>
            <input type='text' className='pt-input' value={this.state.value} onChange={(e) => this.setState({value: e.target.value})} />
            <Button disabled={this.state.value === this.props.field.val} onClick={this.edit}>save</Button>
          </form>
        </td>
        <td className='center'><Button className='pt-icon-trash' onClick={this.remove} /></td>
      </tr>
    )
  }
}

const FieldsEditorWrapper = ({fieldsObject, ...props}) => {
  const fields = mapObjectToPairs(fieldsObject)
  return (
    <div className='mb-10 p-0 pt-card pt-card pt-card--dark'>
      <div style={{padding: '6px 12px'}}>
        <NamesList names={props.names} />
      </div>
      <table className='w--100 pt-table pt-bordered pt-condensed'>
        <tbody>
          {fields.length > 0
            ? fields.map((field, i) => <FieldEditor key={i} field={field} {...props} />)
            : <tr><td className='center'><span className='pt-text-muted'>add fields below</span> 👇</td></tr>
          }
        </tbody>
      </table>
    </div>
  )
}

export default class CustomFieldsEditor extends React.PureComponent {
  state = INITIAL_STATE
  updateName = (fieldName: string): void => {
    this.setState({fieldName})
  }
  isValid = (): boolean => this.state.fieldName.length > 0
  getObject = () => ({[this.state.fieldName]: this.state.fieldValue})
  submitNewField = (e: any): void => {
    e && e.preventDefault()
    if (this.isValid()) {
      this.updateFields(this.getObject())
      this.setState(INITIAL_STATE)
    }
  }
  updateFields = (field: {}, names?: Array<string>) => {
    this.props.submitHandler({fields: fields => merge(fields, field)}, names && names)
  }
  handleRemoveField = (key: string, names: Array<string>) => {
    this.props.submitHandler({fields: omit([key])}, names && names)
  }
  render () {
    return (
      <EditorWrapper title='Custom Fields:'>
        <div>{
          groupFieldsData(this.props.files)
            .sort((a, b) => a.names.length > b.names.length ? -1 : 1)
            .map((data, i) => (
              <FieldsEditorWrapper
                key={i}
                names={data.names}
                fieldsObject={data.fields}
                editHandler={this.updateFields}
                removeHandler={this.handleRemoveField}
              />
            ))
        }</div>
        <div className='to-front'>
          <div className='flex mt-10'>
            <AutocompleteInput
              onSelect={this.updateName}
              items={this.props.allCustomFieldsKeys}
              value={this.state.fieldName}
              onChange={e => this.setState({fieldName: e.target.value})}
              placeholder='Field name'
            />
            <form onSubmit={this.submitNewField} className='ml-10'>
              <input
                type='text'
                value={this.state.fieldValue}
                onChange={(e) => { this.setState({fieldValue: e.target.value}) }}
                className='pt-input mr-10'
                placeholder='Field value'
              />
              <Button
                className='pt-icon-add'
                disabled={!this.isValid()}
                onClick={this.submitNewField}
              >add to {pluralize('file', this.props.files)}</Button>
            </form>
          </div>
        </div>
      </EditorWrapper>
    )
  }
}
