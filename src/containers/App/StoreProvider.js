import { Provider } from 'react-redux'
import React from 'react'
import { PersistGate } from 'redux-persist/integration/react'

export default ({ appConfig, children }) => {
  const { store, persistor } = appConfig.configureStore()

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
