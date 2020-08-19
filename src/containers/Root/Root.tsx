import Fade from '@material-ui/core/Fade'
import React, { FunctionComponent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import LoadingComponent from '../../components/LoadingComponent'
import AppLayout from '../../containers/AppLayout'
import { createUserShellCompositor } from '../../middleware/compositor/actions'

const Root: FunctionComponent = () => {
  const dispatch = useDispatch()
  dispatch(createUserShellCompositor())
  const loaded = useSelector((store) => isLoaded(store.firebase.auth))

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

export default React.memo(Root)
