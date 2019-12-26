import React, { useEffect } from 'react'
import { useCompositor } from '../../contexts/CompositorProvider'

const UserSurface = ({ workspaceRef, userSurface }) => {
  const { actions: compositorActions } = useCompositor()
  useEffect(() => {
    const mainView = compositorActions.createView(userSurface)
    mainView.attachTo(workspaceRef.current)
    return () => {
      mainView.detach()
      mainView.destroy()
    }
  }, [compositorActions, userSurface, workspaceRef])
  return <span />
}

export default UserSurface
