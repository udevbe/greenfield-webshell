import AppLayout from '../../containers/AppLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import LoadingComponent from '../../components/LoadingComponent'
import { saveInstallProposalEvent } from '../../store/addToHomeScreen'
import Fade from '@material-ui/core/Fade'

// TODO use A2HS with hooks/different lib
const Root = () => {
  const loaded = useSelector(({ firebase }) => isLoaded(firebase.auth))
  const dispatch = useDispatch()
  useEffect(() => {
    const beforeInstallPromptEventHandler = event => {
      event.preventDefault()
      dispatch(saveInstallProposalEvent(event))
    }
    window.addEventListener('beforeinstallprompt', beforeInstallPromptEventHandler)
    return () => window.removeEventListener('beforeinstallprompt', beforeInstallPromptEventHandler)
  })

  if (loaded) {
    return (
      <Fade in timeout={300}>
        <div>
          <AppLayout />
        </div>
      </Fade>
    )
  } else {
    return <LoadingComponent />
  }
}

export default Root
