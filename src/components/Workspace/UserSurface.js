import React, { useEffect, useRef } from 'react'
import { useCompositor } from '../../contexts/CompositorProvider'

const UserSurface = React.memo(({ workspaceRef, id, clientId, active }) => {
  const { actions: compositorActions } = useCompositor()
  const mainViewRef = useRef(null)

  useEffect(() => {
    const mainView = compositorActions.createView({ id, clientId })
    mainViewRef.current = mainView

    mainView.attachTo(workspaceRef.current)
    compositorActions.requestActive({ id, clientId })

    return () => {
      mainView.detach()
      mainView.destroy()
      mainViewRef.current = null
    }
  }, [compositorActions, id, clientId, workspaceRef])

  if (mainViewRef.current && active) {
    mainViewRef.current.raise()
  }

  return null
})

export default UserSurface
