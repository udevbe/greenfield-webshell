import React, { lazy, Suspense } from 'react'
import config from '../../config'
import { Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import AppProviders from './AppProviders'
import StoreProvider from './StoreProvider'
import { CssBaseline } from '@material-ui/core'
import Helmet from 'react-helmet'
import { Route, Switch } from 'react-router'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'

const history = createBrowserHistory()

const Root = lazy(() => import('../Root'))
const SignIn = lazy(() => import('../../pages/SignIn'))
const FirebaseProvider = lazy(() => import('./FirebaseProvider'))

const App = () => {
  return (
    <React.StrictMode>
      <StoreProvider appConfig={config}>
        <AppProviders appConfig={config}>
          <CssBaseline />
          <Helmet>
            <html lang='en' />
            <meta
              name='Description'
              content='Greenfield. A fully distributed cloud desktop. Run applications remotely from physically different machines, or run them directly inside your browser. All at the same time.'
            />
            <meta name='theme-color' content='#dcdcdc' />
            <link rel='manifest' href='/manifest.json' />
            <link rel='subresource' href='logo.png' />
            <link rel='subresource' href='index.css' />
            <link rel='preload' href='https://fonts.googleapis.com/css?family=Roboto:300,400,500' as='font' />
            <link rel='preload' href='https://fonts.googleapis.com/css?family=Montserrat:200,300,400,500' as='font' />
            <link rel='stylesheet' type='text/css' href='index.css' />
            <link rel='stylesheet' type='text/css' href='https://cdn.firebase.com/libs/firebaseui/3.0.0/firebaseui.css' />
            <link rel='dns-prefetch' href='https://fonts.googleapis.com' />
            <link rel='preconnect' href='https://fonts.googleapis.com' />
            <link rel='dns-prefetch' href='https://cdn.firebase.com' />
            <link rel='preconnect' href='https://cdn.firebase.com' />
          </Helmet>
          <Router history={history}>
            <Suspense fallback={<LoadingComponent />}>
              <FirebaseProvider>
                <Switch>
                  <Route path='/signin' exact strict>
                    <SignIn />
                  </Route>
                  <Route>
                    <Root />
                  </Route>
                </Switch>
              </FirebaseProvider>
            </Suspense>
          </Router>
        </AppProviders>
      </StoreProvider>
    </React.StrictMode>
  )
}

export default App
