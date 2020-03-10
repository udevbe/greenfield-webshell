import storage from 'redux-persist/es/storage'

import rootReducer from './reducers'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import { actionTypes } from 'react-redux-firebase'
import compositorMiddleware from '../middleware/compositor'
import { createBrowserHistory } from 'history'
import { routerMiddleware } from 'connected-react-router'

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [
    'firebase',
    'simpleValues',
    'addToHomeScreen',
    'compositor',
    'notification',
    'serviceWorker'
  ]
}

export default () => {
  const history = createBrowserHistory()
  const persistedReducer = persistReducer(persistConfig, rootReducer(history))
  const store = configureStore({
    reducer: persistedReducer,
    middleware: [
      ...getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            FLUSH,
            REHYDRATE,
            PAUSE,
            PERSIST,
            PURGE,
            REGISTER,
            ...Object.values(actionTypes)
          ]
        }
      }),
      routerMiddleware(history),
      compositorMiddleware
    ]
  })
  const persistor = persistStore(store)
  return { store, persistor, history }
}
