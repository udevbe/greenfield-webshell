import storage from 'redux-persist/es/storage'

import rootReducer from './reducers'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import { actionTypes } from 'react-redux-firebase'

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

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware({
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
    })
  })
  const persistor = persistStore(store)
  return { store, persistor }
}
