import dialogs from './dialogs/reducer'
import { firebaseReducer as firebase } from 'react-redux-firebase'
import locale from './locale/reducer'
import persistentValues from './persistentValues/reducer'
import simpleValues from './simpleValues/reducer'
import themeSource from './themeSource/reducer'
import drawer from './drawer'
import { combineReducers } from 'redux'
import addToHomeScreen from './addToHomeScreen'
import compositor from './compositor'
import notification from './notification'
import serviceWorker from './serviceworker'

export default combineReducers({
  firebase,
  dialogs,
  locale,
  persistentValues,
  simpleValues,
  drawer,
  themeSource,
  addToHomeScreen,
  compositor,
  notification,
  serviceWorker
})
