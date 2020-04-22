import * as types from './types'

const initialState = {
  themeId: 'default',
  isNightModeOn: false,
}

const themeSource = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_THEME:
      return { ...state, themeId: action.themeId }
    case types.SWITCH_NIGHT_MODE:
      return { ...state, isNightModeOn: action.isNightModeOn }
    default:
      return state
  }
}

export default themeSource
