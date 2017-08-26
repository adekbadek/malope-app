// @flow
import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'

import layout from './layout'

export default combineReducers({
  router,
  layout,
})
