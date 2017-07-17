// @flow
import React from 'react'
import { omit, prop } from 'ramda'
import cx from 'classnames'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import styles from './Home.sass'
import { EXIF_TAG_NAME, writeComment, normalizePath, mapObjectToPairs } from '../utils/helpers'

export default class ImageThumb extends React.Component {
  submitComment = e => {
    e.preventDefault()
    writeComment(this.props.image, this.refs.commentTextArea.value)
      .then(this.props.updateCallback)
  }
  render () {
    return (
      <div className={cx('mt4', styles.imageThumb)}>
        <div className='center bt bb pv1'>{this.props.image.name}</div>
        <div className='flex'>
          <div className='dib pa2'>
            <div
              className={styles.imageThumbTile}
              style={{backgroundImage: `url(${normalizePath(this.props.image.path)})`}}
            />
          </div>
          <div className='dib pa2 flex__1'>
            <Tabs>
              <TabList>
                <Tab>Custom Data</Tab>
                <Tab>All Data</Tab>
              </TabList>
              <TabPanel>
                <div className='mt3'>
                  <div>{prop(EXIF_TAG_NAME, this.props.image.metadata)}</div>
                  <form onSubmit={this.submitComment}>
                    <textarea ref='commentTextArea' className='w-100 mt2' rows='5' />
                    <input type='submit' value='Submit' />
                  </form>
                </div>
              </TabPanel>
              <TabPanel>
                <div className='mt2'>
                  {mapObjectToPairs(omit([EXIF_TAG_NAME], this.props.image.metadata)).map(v => (
                    <div className='flex mt1' key={v.key}>
                      <div className='w-50 dib'>{v.key}</div>
                      <div className='w-50 dib'>{v.val}</div>
                    </div>
                  ))}
                </div>
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }
}
