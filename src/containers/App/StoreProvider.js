import { Provider } from 'react-redux'
import React from 'react'

export default ({ appConfig, children }) => <Provider store={appConfig.configureStore()}>{children}</Provider>
