// @flow
import React from 'react'
import debounce from 'lodash.debounce'

const QUERY_SPLIT = ','
const parseQuery = (query: string): Array<string> => query.trim().split(QUERY_SPLIT).map(v => v.trim())

export default class SearchField extends React.Component {
  state = {
    query: '',
  }
  componenWillUnmount () {
    this.handleChange.cancel()
  }
  updateQuery = (e: any) => {
    this.setState({
      query: e.currentTarget.value
    }, () => {
      this.handleChange(
        parseQuery(this.state.query)
      )
    })
  }
  handleChange = debounce(this.props.onSearch, 400)
  render () {
    return (
      <div className='dib mb-20 pr-20'>
        <div className='pt-input-group'>
          <span className='pt-icon pt-icon-search' />
          <input
            className='pt-input'
            type='search'
            placeholder='Filter'
            dir='auto'
            value={this.state.query}
            onChange={this.updateQuery}
          />
        </div>
        {this.state.query.trim().length > 0 && (
          <div className='mt-10 pt-callout pt-icon-filter'>
            {parseQuery(this.state.query).map((v, i) => v.length > 0 && (
              <span key={i} className='pt-tag pt-intent-primary pt-round mr-5 mb-5'>{v}</span>
            ))}
            <div style={{opacity: '.5', fontSize: '12px'}}>
              showing {this.props.filteredLen} out of {this.props.allLen} images
            </div>
          </div>
        )}
      </div>
    )
  }
}
