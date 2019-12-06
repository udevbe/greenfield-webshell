import AppLayout from '../../containers/AppLayout'
import React, { useEffect } from 'react'
import { withA2HS } from 'a2hs'
import { useDispatch, useSelector } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import LoadingComponent from '../../components/LoadingComponent'
import { saveInstallProposalEvent } from '../../store/addToHomeScreen/actions'

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
      <div>
        <AppLayout />
      </div>
    )
  } else {
    return <LoadingComponent />
  }
}

export default withA2HS(Root)
