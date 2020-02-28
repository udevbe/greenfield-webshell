import React, { useEffect, useRef } from 'react'
import { useCompositor } from '../../contexts/CompositorProvider'

const UserSurface = React.memo(({ id, clientId, active, sceneId }) => {
  const { actions: compositorActions } = useCompositor()
  const mainViewRef = useRef(null)

  useEffect(() => {
    const mainView = compositorActions.createView({ id, clientId }, sceneId)
    mainViewRef.current = mainView
    compositorActions.requestActive({ id, clientId })

    return () => {
      mainView.destroy()
      mainViewRef.current = null
    }
  }, [compositorActions, id, clientId, sceneId])

  if (mainViewRef.current && active) {
    compositorActions.raise({ id, clientId }, sceneId)
  }

  return null
})

export default UserSurface
