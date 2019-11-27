import AppLayout from '../../containers/AppLayout'
import React from 'react'
import { withA2HS } from 'a2hs'
import { useSelector } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'

let installPromptShowed = false

// TODO use A2HS with hooks/different lib
const Root = ({ deferredPrompt, isAppInstallable, isAppInstalled }) => {
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
  const isAuthorized = useSelector(({ firebase: { auth } }) => !isEmpty(auth))
  const showInstallPrompt = isAuthorized && isAppInstallable && !isAppInstalled
  const handleInstallPrompt = () => {
    if (!installPromptShowed && showInstallPrompt) {
      installPromptShowed = true
      deferredPrompt.prompt()
    }
  }

  return (
    <div onClick={!installPromptShowed && showInstallPrompt ? handleInstallPrompt : undefined}>
      <AppLayout />
    </div>
  )
}

export default withA2HS(Root)
