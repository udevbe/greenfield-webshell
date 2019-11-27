import React from 'react'
import config from '../../config'
import { Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import AppProviders from './AppProviders'
import StoreProvider from './StoreProvider'
import makeLoadable from '../MyLoadable'
import { CssBaseline } from '@material-ui/core'
import Helmet from 'react-helmet'
import { Route, Switch } from 'react-router'

const history = createBrowserHistory()

const RootAsync = makeLoadable({
  loader: () => import('../Root'),
  firebase: config.firebaseLoader
})

const SignInAsync = makeLoadable({
  loader: () => import('../../pages/SignIn'),
  firebase: config.firebaseLoader
})

const App = () => {
  return (
    <StoreProvider appConfig={config}>
      <AppProviders appConfig={config}>
        <CssBaseline />
        <Helmet>
          <link rel='stylesheet' type='text/css' href='https://cdn.firebase.com/libs/firebaseui/3.0.0/firebaseui.css' />
        </Helmet>
        <Router history={history}>
          <Switch>
            <Route path='/signin' exact strict>
              <SignInAsync />
            </Route>
            <Route>
              <RootAsync />
            </Route>
          </Switch>
        </Router>
      </AppProviders>
    </StoreProvider>
  )
}

export default App
