import AppLayout from '../../containers/AppLayout'
import React from 'react'
import { withA2HS } from 'a2hs'
import { useSelector } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import LoadingComponent from '../../components/LoadingComponent'

let installPromptShowed = false

// TODO use A2HS with hooks/different lib
const Root = ({ deferredPrompt, isAppInstallable, isAppInstalled }) => {
  const loaded = useSelector(({ firebase }) => isLoaded(firebase.auth))

  if (loaded) {
    const showInstallPrompt = isAppInstallable && !isAppInstalled
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
  } else {
    // TODO set a timer to enable pastDelay
    return <LoadingComponent pastDelay />
  }
}

export default withA2HS(Root)
