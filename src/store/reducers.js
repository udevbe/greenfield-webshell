import dialogs from './dialogs/reducer'
import { firebaseReducer } from 'react-redux-firebase'
import initState from './init'
import locale from './locale/reducer'
import persistentValues from './persistentValues/reducer'
import rootReducer from './rootReducer'
import simpleValues from './simpleValues/reducer'
import themeSource from './themeSource/reducer'
import drawer from './drawer/reducer'
import { combineReducers } from 'redux'

export const appReducers = {
  firebaseReducer,
  dialogs,
  locale,
  persistentValues,
  simpleValues,
  drawer,
  themeSource
}

const appReducer = combineReducers(appReducers)

export default (state, action) => rootReducer(appReducer, initState, state, action)
