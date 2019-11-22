import AppLayout from '../../containers/AppLayout'
import { CssBaseline } from '@material-ui/core'
import Helmet from 'react-helmet'
import React from 'react'
import locales, { getLocaleMessages } from '../../config/locales'
import { IntlProvider } from 'react-intl'
import { Route, Router, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { saveAuthorisation } from '../../utils/auth'
import { shallowEqual, useSelector } from 'react-redux'
import { withA2HS } from 'a2hs'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { isEmpty } from 'react-redux-firebase'

const history = createBrowserHistory()

let installPromptShowed = false

function updateUserOnlineStatus (firebase, user) {
  const myConnectionsRef = firebase.database.ref(`users/${user.uid}/connections`)
  const lastOnlineRef = firebase.database.ref(`users/${user.uid}/lastOnline`)
  lastOnlineRef.onDisconnect().set(new Date())
  const con = myConnectionsRef.push(true)
  con.onDisconnect().remove()
}

function updateUserPublicData (firebase, user) {
  const publicProviderData = []

  user.providerData.forEach(provider => {
    publicProviderData.push({
      providerId: provider.providerId,
      displayName: provider.displayName ? provider.displayName : null
    })
  })

  const publicUserData = {
    displayName: user.displayName ? user.displayName : 'UserName',
    photoURL: user.photoURL,
    uid: user.uid,
    providerData: publicProviderData
  }

  firebase.database.ref(`users/${user.uid}`).update(publicUserData)
}

// TODO use A2HS with hooks/different lib
const Root = ({ deferredPrompt, isAppInstallable, isAppInstalled }) => {
  const appConfig = useAppConfig()

  const firebase = useSelector(({ firebase }) => firebase)
  const auth = useSelector(({ firebase: { auth } }) => auth)
  const locale = useSelector(({ locale }) => locale, shallowEqual)

  const messages = { ...getLocaleMessages(locale, locales), ...getLocaleMessages(locale, appConfig.locales) }

  if (isEmpty(auth)) {
    saveAuthorisation(null)
  } else {
    const user = auth.User
    saveAuthorisation(user)

    updateUserOnlineStatus(firebase, user)
    updateUserPublicData(firebase, user)

    // const userData = {
    //   displayName: user.displayName ? user.displayName : 'UserName',
    //   email: user.email ? user.email : ' ',
    //   photoURL: user.photoURL,
    //   emailVerified: user.emailVerified,
    //   isAnonymous: user.isAnonymous,
    //   uid: user.uid,
    //   providerData: user.providerData
    // }
    // TODO add chat/messaging
    // initializeMessaging({ ...props, ...actions, initMessaging, firebaseApp, history, auth: userData }, true)
  }

  const showInstallPrompt = auth.isAuthorised && isAppInstallable && !isAppInstalled
  const handleInstallPrompt = () => {
    if (!installPromptShowed && showInstallPrompt) {
      installPromptShowed = true
      deferredPrompt.prompt()
    }
  }

  return (
    <div onClick={!installPromptShowed && showInstallPrompt ? handleInstallPrompt : undefined}>
      <Helmet>
        <link rel='stylesheet' type='text/css' href='https://cdn.firebase.com/libs/firebaseui/3.0.0/firebaseui.css' />
      </Helmet>
      <>
        <CssBaseline />
        <IntlProvider locale={locale} key={locale} messages={messages}>
          <Router history={history}>
            <Switch>
              <Route component={AppLayout} />
            </Switch>
          </Router>
        </IntlProvider>
      </>
    </div>
  )
}

export default withA2HS(Root)
