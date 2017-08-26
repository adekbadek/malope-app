// @flow
import { assoc } from 'ramda'

const initialState = {
  themeName: 'pt-dark',
}

export default (state = initialState, action) => {
  const { payload } = action

  switch (action.type) {
    case 'CHANGE_THEME':
      return assoc('themeName', payload, state)
    default:
      return state
  }
}
