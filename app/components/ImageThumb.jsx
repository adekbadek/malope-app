// @flow
import React from 'react'
import { omit, prop } from 'ramda'
import cx from 'classnames'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import styles from './Home.sass'
import { EXIF_TAG_NAME, writeComment, normalizePath, mapObjectToPairs } from '../utils/helpers'
import ObjectBuilder from './ObjectBuilder'
import Pair from './Pair'

export default class ImageThumb extends React.Component {
  submitCustomData = (object: {}) => {
    writeComment(this.props.image, JSON.stringify(object))
      .then(this.props.updateCallback)
  }
  render () {
    const customData = prop(EXIF_TAG_NAME, this.props.image.metadata)
    return (
      <div className={cx('mt4', styles.imageThumb)}>
        <div className='center bt bb pv1'>{this.props.image.name}</div>
        <div className='flex'>
          <div className='dib pa2'>
            <div
              className={cx(styles.imageThumbTile, styles.imageThumbTileLarge)}
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
                  <pre className='mb3'>{customData}</pre>
                  <ObjectBuilder
                    onSubmit={this.submitCustomData}
                    defaultObject={customData ? JSON.parse(customData) : {}}
                  />
                </div>
              </TabPanel>
              <TabPanel>
                <div className='mt2'>
                  {mapObjectToPairs(omit([EXIF_TAG_NAME], this.props.image.metadata)).map(v => (
                    <Pair key={v.key} pair={v} />
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
