import CompositorMiddleWare from './CompositorMiddleWare'

const compositorMiddleWareReducers = CompositorMiddleWare.create()
const compositorMiddleware = store => next => action => {
  if (compositorMiddleWareReducers[action.type]) {
    compositorMiddleWareReducers[action.type](store, next, action)
  } else {
    next(action)
  }
}

export default compositorMiddleware
