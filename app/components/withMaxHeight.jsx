// @flow
import React from 'react'

type WithMaxHeightState = {
  topOffset: number
};

export default (WrappedComponent: any) => {
  return class PP extends React.Component {
    state = {
      topOffset: 0,
    }
    componentDidUpdate (_: {}, prevState: WithMaxHeightState) {
      const topOffset = this.mainRef.getBoundingClientRect().top
      if (this.state.topOffset !== topOffset) {
        this.setOffset(topOffset)
      }
    }
    setOffset = (topOffset: number) => {
      this.setState({
        topOffset,
      })
    }
    mainRef = {}
    render () {
      return (
        <WrappedComponent
          getRef={v => { this.mainRef = v }}
          style={{maxHeight: `calc(100vh - ${this.state.topOffset}px)`}}
          {...this.props}
        />
      )
    }
  }
}
