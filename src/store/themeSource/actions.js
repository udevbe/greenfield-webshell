import * as types from './types'

export function updateTheme(themeId) {
  return {
    type: types.UPDATE_THEME,
    themeId,
  }
}
