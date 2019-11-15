import * as types from './types'

export function setApplicationIsRunning (id, isRunning) {
  return {
    type: types.ON_APPLICATION_RUNNING_CHANGED,
    id,
    isRunning
  }
}
