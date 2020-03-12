import CompositorMiddleWare from './CompositorMiddleWare'

const compositorMiddleWareReducers = CompositorMiddleWare.create()
const compositorMiddleware = store => next => action => {
  if (compositorMiddleWareReducers[action.type]) {
    return compositorMiddleWareReducers[action.type](store, next, action)
  } else {
    return next(action)
  }
}

export default compositorMiddleware
