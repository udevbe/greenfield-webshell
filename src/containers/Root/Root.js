import AppLayout from '../../containers/AppLayout'
import React from 'react'
import { useSelector } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import LoadingComponent from '../../components/LoadingComponent'
import Fade from '@material-ui/core/Fade'

const Root = React.memo(() => {
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
