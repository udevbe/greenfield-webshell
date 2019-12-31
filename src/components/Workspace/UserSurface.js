import React, { useEffect, useRef } from 'react'
import { useCompositor } from '../../contexts/CompositorProvider'
import { useSelector } from 'react-redux'

const UserSurface = React.memo(({ workspaceRef, id, clientId, userSurfaceKey }) => {
  const { actions: compositorActions } = useCompositor()
  const pointerGrabKey = useSelector(({ compositor }) => compositor.seat.pointerGrab ? compositor.seat.pointerGrab.key : null)
  const mainViewRef = useRef(null)

  useEffect(() => {
    const mainView = compositorActions.createView({ id, clientId })
    mainViewRef.current = mainView

    mainView.attachTo(workspaceRef.current)
    mainView.raise()
    compositorActions.requestActive({ id, clientId })

    return () => {
      mainView.detach()
      mainView.destroy()
      mainViewRef.current = null
    }
  }, [compositorActions, id, clientId, workspaceRef])

  useEffect(() => {
    if (pointerGrabKey === userSurfaceKey && mainViewRef.current) {
      mainViewRef.current.raise()
    }
  }, [mainViewRef, userSurfaceKey, pointerGrabKey])

  return null
})

export default UserSurface
