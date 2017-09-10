// @flow
import React from 'react'
import ReactImageMagnify from 'react-image-magnify'
import Combokeys from 'combokeys'

export default class ImagePreview extends React.PureComponent {
  state = {
    zoom: 2,
  }
  componentDidMount () {
    this.combokeys = new Combokeys(document.documentElement)
    this.combokeys && this.combokeys.bind('plus', () => { this.setState(({zoom}) => ({zoom: Math.min(10, zoom + 0.2)})) })
    this.combokeys && this.combokeys.bind('minus', () => { this.setState(({zoom}) => ({zoom: Math.max(1, zoom - 0.2)})) })
  }
  componentWillUnmount () {
    this.combokeys && this.combokeys.detach()
  }
  combokeys = null
  render () {
    const { image } = this.props
    return (
      <div className='pt-10 pr-20'>
        <div className='pt-card p-5'>
          <div className='mb-10 pt-callout pt-intent-primary'>
            Previewing {image.name}
            <br />
            Hover over the image to zoom. Zoom level is <code>{this.state.zoom.toFixed(1)}</code>. Change it with <code>+</code> / <code>-</code>
          </div>
          <div>
            <ReactImageMagnify
              enlargedImageContainerClassName='react-image-magnify__enlarged'
              enlargedImagePosition='over'
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
      </div>
    )
  }
}
