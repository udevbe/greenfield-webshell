import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import React, { FunctionComponent } from 'react'
import { PersistGate } from 'redux-persist/integration/react'
import { AppConfig } from '../../config/config'

const StoreProvider: FunctionComponent<{ appConfig: AppConfig }> = ({ appConfig, children }) => {
  const { store, persistor, history } = appConfig.configureStore()

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </ConnectedRouter>
    </Provider>
  )
}
export default StoreProvider
