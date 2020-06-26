import React, { FunctionComponent, lazy, Suspense, useEffect } from 'react'
import config from '../../config'
import AppProviders from './AppProviders'
import StoreProvider from './StoreProvider'
import { CssBaseline } from '@material-ui/core'
import { Helmet } from 'react-helmet'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'
import { useDispatch } from 'react-redux'
import { saveInstallProposalEvent } from '../../store/addToHomeScreen'
import * as serviceWorker from '../../utils/serviceWorker'
import { registrationSuccess, updateAvailable } from '../../store/serviceworker'

const Root = lazy(() => import('../Root'))
const FirebaseProvider = lazy(() => import('./FirebaseProvider'))

const AppBody = React.memo(() => {
  const dispatch = useDispatch()

  useEffect(() => {
    const beforeInstallPromptEventHandler: EventListener = (event) => {
      event.preventDefault()
      dispatch(saveInstallProposalEvent(event))
    }
    window.addEventListener('beforeinstallprompt', beforeInstallPromptEventHandler)

    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      // @ts-ignore
      const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (iOS) {
        serviceWorker.register()
      } else {
        navigator.serviceWorker.ready.then((registration) => {
          dispatch(registrationSuccess(registration))
          setInterval(() => registration.update(), 5000)
        })
        serviceWorker.register({
          onUpdate: (registration) => dispatch(updateAvailable(registration)),
        })
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', beforeInstallPromptEventHandler)
  }, [dispatch])

  return (
    <Suspense fallback={<LoadingComponent />}>
      <FirebaseProvider>
        <Root />
      </FirebaseProvider>
    </Suspense>
  )
})

const App: FunctionComponent = () => {
  return (
    <React.StrictMode>
      <StoreProvider appConfig={config}>
        <AppProviders appConfig={config}>
          <CssBaseline />
          <Helmet>
            <html lang="en" />
            <meta
              name="Description"
              content="Greenfield. A fully distributed cloud desktop. Run applications remotely from physically different machines, or run them directly inside your browser. All at the same time."
            />
            <meta name="theme-color" content="#dcdcdc" />
            <meta name="mobile-web-app-capable" content="yes" />
            <link rel="manifest" href="manifest.json" />
            <link rel="subresource" href="logo.png" />
            <link rel="subresource" href="index.css" />
            <link rel="preload" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" as="font" />
            <link rel="preload" href="https://fonts.googleapis.com/css?family=Montserrat:200,300,400,500" as="font" />
            <link rel="stylesheet" type="text/css" href="index.css" />
            <link
              rel="stylesheet"
              type="text/css"
              href="https://cdn.firebase.com/libs/firebaseui/3.0.0/firebaseui.css"
            />
            <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="dns-prefetch" href="https://cdn.firebase.com" />
            <link rel="preconnect" href="https://cdn.firebase.com" />
          </Helmet>
          <AppBody />
        </AppProviders>
      </StoreProvider>
    </React.StrictMode>
  )
}

export default App
