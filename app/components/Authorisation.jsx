// @flow

import React, { Component } from 'react'
import { Spinner } from '@blueprintjs/core'

import { showWarning, showInfo } from './MainToaster'
import ExternalLink from './ExternalLink'
import { saveAuthkey, retrieveAuthkey } from '../utils/storage'

const isAuthorised = async (authkey: string, showInfoAfter?: boolean) => {
  const res = await fetch(
    `https://authkey.malope.software/verify/${encodeURIComponent(authkey)}`,
    {method: 'POST'}
  )
  const {message} = await res.json()
  if (res.status === 200) {
    showInfoAfter && showInfo(message)
    return true
  } else {
    showWarning(message)
    return false
  }
}

const Errored = () =>
  <div className='p-20'>
    <div className='mb-10 pt-callout pt-intent-warning'>
      Could not reach the API. Make sure you're connected to the Internet.
      <br />
      <a href='mailto:hello@malope.software'>Contact support - hello@malope.software</a>
    </div>
  </div>

class UnauthorisedView extends React.Component {
  state = {
    value: '',
  }
  render () {
    return (
      <div className='mt-50 flex flex--center center'>
        <div className='pt-callout pt-intent-primary'>
          <div className='flex flex--center flex--column p-30'>
            <div>Enter your authorisation key:</div>
            <form
              className='mt-20 flex flex--column'
              onSubmit={e => {
                e.preventDefault()
                this.props.onSubmit(this.state.value)
              }}
            >
              <input
                type='text'
                className='pt-input'
                value={this.state.value}
                onChange={({currentTarget}) => this.setState({value: currentTarget.value})}
              />
              <button
                className='pt-button pt-intent-primary mt-5'
                disabled={this.state.value.length === 0}
              >submit</button>
            </form>
            <div className='mt-20'>
              Obtain an authorisation key at
              <br />
              <ExternalLink href='https://malope.software/download'>malope.software/download</ExternalLink>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const Loading = () =>
  <div className='flex flex--center' style={{marginTop: '20vh'}}><Spinner className='pt-large' /></div>

export default class AuthorisationHandling extends Component {
  state = {
    status: 'loading',
  }
  // $FlowFixMe
  async componentDidMount () {
    const {authkey} = await retrieveAuthkey()
    if (authkey) {
      this.checkAuthorisation(authkey)
    } else {
      this.setState({status: 'unauthorised'})
    }
  }
  checkAuthorisation = async (authkey: string, showInfoAfter?: boolean) => {
    this.setState({status: 'loading'})
    const authed = await isAuthorised(authkey, showInfoAfter)
    this.setState({status: authed ? 'authorised' : 'unauthorised'})
    if (authed) {
      saveAuthkey({authkey})
    }
  }
  getComponent = (onSubmit: (string) => void) => ({
    loading: Loading,
    error: Errored,
    authorised: this.props.authorisedRenderer,
    unauthorised: () => <UnauthorisedView onSubmit={onSubmit} />,
  })
  onSubmit = (val: string) => {
    this.checkAuthorisation(val, true)
  }
  render () {
    return (
      <div className={this.props.themeName}>
        {this.getComponent(this.onSubmit)[this.state.status]()}
      </div>
    )
  }
}
