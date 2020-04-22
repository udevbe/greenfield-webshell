import storage from 'redux-persist/es/storage'

import rootReducer from './reducers'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'
import { actionTypes } from 'react-redux-firebase'
import createSagaMiddleware from 'redux-saga'
import { createBrowserHistory } from 'history'
import { routerMiddleware } from 'connected-react-router'
import compositorSaga from '../middleware/compositor/compositorSaga'

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [
    'firebase',
    'simpleValues',
    'addToHomeScreen',
    'compositor',
    'notification',
    'serviceWorker',
  ],
}

export default () => {
  const history = createBrowserHistory()
  const persistedReducer = persistReducer(persistConfig, rootReducer(history))
  const sagaMiddleware = createSagaMiddleware()
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
            ...Object.values(actionTypes),
          ],
        },
      }),
      routerMiddleware(history),
      sagaMiddleware,
    ],
  })
  const persistor = persistStore(store)

  sagaMiddleware.run(compositorSaga)

  return { store, persistor, history }
}
