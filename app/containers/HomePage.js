// @flow

import React from 'react'
import { connect } from 'react-redux'

import Home from '../components/Home'
import AuthorisationHandling from '../components/Authorisation'

export default connect(state => ({
  themeName: state.layout.themeName,
}))(
  (props) => <AuthorisationHandling {...props} authorisedRenderer={() => <Home />} />
)
