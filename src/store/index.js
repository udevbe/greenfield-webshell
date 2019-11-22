import { applyMiddleware, compose, createStore } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import reducers from './reducers'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/es/storage' // default: localStorage if web, AsyncStorage if react-native

export default function configureStore () {
  const logger = createLogger({})

  const middlewares = [thunk]

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(logger) // DEV middlewares
  }

  const composeEnhancers =
    typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
      : compose

  const enhancer = composeEnhancers(applyMiddleware(...middlewares))

  const persistorConfig = {
    key: 'root',
    storage,
    blacklist: ['auth', 'form', 'connection', 'initialization', 'messaging', 'simpleValues', 'theme']
  }

  const reducer = persistReducer(persistorConfig, reducers)

  const store = createStore(reducer, {}, enhancer)

  try {
    persistStore(store)
  } catch (e) {}

  return store
}
