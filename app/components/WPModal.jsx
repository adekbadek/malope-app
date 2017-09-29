// @flow
import React from 'react'
import { isEmpty } from 'ramda'
import { Dialog } from '@blueprintjs/core'

import {
  saveWPCreds,
  retrieveWPCreds,
} from '../utils/storage'
import {
  createPostFromImage,
} from '../utils/wp'
import {
  showWarning,
  showInfo,
  downloadProgressInfo,
} from './MainToaster'

const FIELDS = ['site', 'username', 'password']

class Auth extends React.Component {
  state = {
    site: '',
    username: '',
    password: '',
  }
  submit = (e) => {
    e && e.preventDefault()
    if (this.isValid()) {
      this.props.onSubmit(this.state)
    }
  }
  isValid = () => FIELDS.filter(v => this.state[v].length > 0).length === FIELDS.length
  render () {
    return (
      <form onSubmit={this.submit} className='mb-0 pt-form-group'>
        {FIELDS.map(v => (
          <div key={v} className='mb-10'>
            <label className='pt-label'>{v}</label>
            <input
              type={v === 'password' ? 'password' : 'text'}
              className='pt-input'
              value={this.state[v]}
              onChange={({target}) => {
                this.setState({[v]: target.value})
              }}
            />
          </div>
        ))}
        <button className='mt-10 pt-button' disabled={!this.isValid()}>login</button>
      </form>
    )
  }
}

export default class WPModal extends React.Component {
  state = {
    WPCreds: null,
    uploading: false,
  }
  componentDidMount () {
    retrieveWPCreds().then(WPCreds => {
      if (!isEmpty(WPCreds)) {
        showInfo(`loaded WP credentials for ${WPCreds.username}`)
        this.authenticate(WPCreds)
      }
    })
  }
  authenticate = (WPCreds: any) => {
    this.setState({WPCreds})
  }
  submitAuth = ({site, ...data}: any) => {
    const WPCreds = {
      endpoint: `${site}/wp-json/wp/v2`,
      site,
      ...data,
    }
    this.authenticate(WPCreds)
    saveWPCreds(WPCreds)
    showInfo('saving WP credentials')
  }
  addAllAsPosts = () => {
    this.setState({uploading: true})
    let int = 0
    let imgLen = this.props.images.length
    downloadProgressInfo(1)
    this.props.images.map((image, i) => {
      createPostFromImage(this.state.WPCreds, image)
        .then(res => {
          int++
          downloadProgressInfo(int / imgLen * 100)
          if (int === imgLen) {
            showInfo(`added ${imgLen} posts`)
            this.setState({uploading: false})
          }
        })
        .catch(res => {
          showWarning(res)
        })
    })
  }
  removeCreds = () => {
    this.setState({WPCreds: null})
    saveWPCreds(null)
    showInfo('removed WP credentials')
  }
  render () {
    const { WPCreds } = this.state
    const imagesLen = this.props.images.length
    return (
      <Dialog
        className='pt-dark'
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        title='WordPress connect'
      >
        <div className='plr-20 pt-20'>
          {WPCreds
            ? <div>
              <div className='mb-10 pt-callout pt-intent-primary'>
                Logged in as {WPCreds.username} @ {WPCreds.site}
                {imagesLen === 0 && <div>
                  Select some images to add as posts
                </div>}
              </div>
              <button
                className='pt-button pt-intent-success'
                onClick={this.addAllAsPosts}
                disabled={imagesLen === 0 || this.state.uploading}
              >
                add {imagesLen} images as posts
              </button>
              <br />
              <button
                className='mt-10 pt-button pt-intent-warning'
                onClick={this.removeCreds}
              >remove WP login data</button>
            </div>
            : <Auth
              onSubmit={this.submitAuth}
            />
          }
        </div>
      </Dialog>
    )
  }
}
