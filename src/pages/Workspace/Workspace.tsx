import type { DefaultRootState } from 'react-redux'
import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import type { FunctionComponent } from 'react'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'
import { activateLastActiveScene } from '../../middleware/compositor/actions'

// TODO use reselect
const compositorInitializing = (state: DefaultRootState) =>
  !state.compositor.initialized

const Workspace: FunctionComponent = () => {
  const dispatch = useDispatch()
  const isCompositorInitializing = useSelector(compositorInitializing)

  if (isCompositorInitializing) {
    return <LoadingComponent />
  } else {
    dispatch(activateLastActiveScene())
    return null
  }
}

export default React.memo(Workspace)
