import * as types from './types'

export default function applications (state = {}, action) {
  switch (action.type) {
    case types.ON_APPLICATION_RUNNING_CHANGED:
      return { ...state, [action.id]: action.isRunning }
    default:
      return state
  }
}
