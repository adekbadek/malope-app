// @flow
import React from 'react'
import ReactImageMagnify from 'react-image-magnify'
import Combokeys from 'combokeys'

export default class ImagePreview extends React.Component {
  state = {
    zoom: 2,
  }
  componentDidMount () {
    this.combokeys = new Combokeys(document.documentElement)
    this.combokeys && this.combokeys.bind('mod+plus', () => { this.setState(({zoom}) => ({zoom: Math.min(10, zoom + 0.2)})) })
    this.combokeys && this.combokeys.bind('mod+minus', () => { this.setState(({zoom}) => ({zoom: Math.max(1, zoom - 0.2)})) })
  }
  componentWillUnmount () {
    this.combokeys && this.combokeys.detach()
  }
  combokeys = null
  render () {
    const { image } = this.props
    return (
      <div className='p-10 dialog-inside'>
        <div className='mb-10 pt-callout pt-intent-primary'>Hover over the image to zoom. Zoom level is <code>{this.state.zoom.toFixed(1)}</code>. Change it with <code>Cmd</code> + <code>+</code> / <code>Cmd</code> + <code>-</code></div>
        <div style={{width: '45%'}}>
          <ReactImageMagnify
            smallImage={{
              isFluidWidth: true,
              src: image.path,
              alt: image.name,
            }}
            largeImage={{
              width: 400 * this.state.zoom,
              height: 400 * this.state.zoom,
              src: image.path,
              alt: image.name,
            }}
          />
        </div>
      </div>
    )
  }
}
