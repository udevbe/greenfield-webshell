import CompositorMiddleWare from './CompositorMiddleWare'
import SharedSceneMiddleWare from './SharedSceneMiddleWare'

/**
 * @returns {string}
 */
export function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

function middleWareReducers (middleWare) {
  return store => next => action => {
    if (middleWare[action.type]) {
      return middleWare[action.type](store, next, action)
    } else {
      return next(action)
    }
  }
}

const compositorMiddleWare = CompositorMiddleWare.create()
const sharedSceneMiddleWare = SharedSceneMiddleWare.create(compositorMiddleWare)

export const compositorMiddleWareReducers = middleWareReducers(compositorMiddleWare)
export const sharedSceneMiddleWareReducers = middleWareReducers(sharedSceneMiddleWare)
