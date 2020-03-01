import AppLayout from '../../containers/AppLayout'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import LoadingComponent from '../../components/LoadingComponent'
import Fade from '@material-ui/core/Fade'
import { initializeCompositor } from '../../store/compositor'

const Root = React.memo(() => {
  const dispatch = useDispatch()
  dispatch(initializeCompositor())
  const loaded = useSelector(({ firebase }) => isLoaded(firebase.auth))

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
})

export default Root
