import React from 'react'
import config from '../../config'
import { BrowserRouter } from 'react-router-dom'
import AppProviders from './AppProviders'
import StoreProvider from './StoreProvider'
import makeLoadable from '../MyLoadable'

export const RootAsync = makeLoadable({
  loader: () => import('../Root'),
  firebase: () => import('../../config/firebaseInit')
})

const App = () => (
  <StoreProvider appConfig={config}>
    <AppProviders appConfig={config}>
      <BrowserRouter>
        <RootAsync />
      </BrowserRouter>
    </AppProviders>
  </StoreProvider>
)

export default App
