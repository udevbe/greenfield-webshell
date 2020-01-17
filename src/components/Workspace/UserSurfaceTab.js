import React from 'react'
import Tab from '@material-ui/core/Tab'
import { useCompositor } from '../../contexts/CompositorProvider'

const UserSurfaceTab = React.memo(({ userSurfaceId, clientId, userSurfaceTitle, value }) => {
  const { actions: compositorActions } = useCompositor()

  const requestActive = () => { compositorActions.requestActive({ id: userSurfaceId, clientId }) }

  return (
    <Tab label={userSurfaceTitle} onClick={requestActive} value={value} />
  )
})

export default UserSurfaceTab
