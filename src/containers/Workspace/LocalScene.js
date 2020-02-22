import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import UserSurface from '../../components/Workspace/UserSurface'
import { useCompositor } from '../../contexts/CompositorProvider'

const canvas = document.createElement('canvas')
canvas.style.width = '100%'
canvas.style.height = '100%'
// backgroundImage: 'url(./pattern_light.png)',
// backgroundSize: 'auto',
// backgroundRepeat: 'repeat',
canvas.style.overflow = 'hidden'
canvas.style.position = 'relative'

const LocalScene = React.memo(({ mainRef }) => {
  const sceneId = 'main-workspace'
  const { actions: compositorActions } = useCompositor()

  const workspaceRef = useRef(canvas)
  useEffect(() => {
    const workspaceElement = /** @type  {HTMLElement} */workspaceRef.current
    const mainElement = /** @type  {HTMLElement} */mainRef.current

    compositorActions.initScene(sceneId, workspaceElement)
    workspaceElement.onpointermove = event => compositorActions.input.pointerMove(event, sceneId)
    workspaceElement.onpointerdown = event => {
      workspaceElement.setPointerCapture(event.pointerId)
      compositorActions.input.buttonDown(event, sceneId)
    }
    workspaceElement.onpointerup = event => {
      compositorActions.input.buttonUp(event, sceneId)
      workspaceElement.releasePointerCapture(event.pointerId)
    }
    workspaceElement.onwheel = event => compositorActions.input.axis(event, sceneId)

    // if (workspaceElement.parentElement !== mainElement) {
    mainElement.appendChild(workspaceElement)
    // }
    return () => { mainElement.removeChild(workspaceElement) }
  }, [workspaceRef, mainRef, compositorActions])

  const activeUserSurfaceRef = useRef(null)

  // FIXME this logic probably belongs in the compositor store instead of here
  const currentActiveUserSurface = useSelector(({ compositor }) => Object.values(compositor.userSurfaces).reduce((previousValue, currentValue) => {
    if (currentValue.active && ((previousValue && currentValue.lastActive > previousValue.lastActive) || previousValue === null)) {
      return currentValue
    } else {
      return previousValue
    }
  }, null) || null)
  if (activeUserSurfaceRef.current && currentActiveUserSurface && activeUserSurfaceRef.current.key !== currentActiveUserSurface.key) {
    compositorActions.notifyInactive(activeUserSurfaceRef.current)
    compositorActions.setKeyboardFocus(currentActiveUserSurface)
  } else if (activeUserSurfaceRef.current && currentActiveUserSurface === null) {
    compositorActions.notifyInactive(activeUserSurfaceRef.current)
  } else if (activeUserSurfaceRef.current === null && currentActiveUserSurface) {
    compositorActions.setKeyboardFocus(currentActiveUserSurface)
  }
  activeUserSurfaceRef.current = currentActiveUserSurface

  // FIXME this logic probably belongs in the compositor store instead of here
  const pointerGrabIsActive = useSelector(({ compositor }) => compositor.seat.pointerGrab ? compositor.userSurfaces[compositor.seat.pointerGrab.key].active : false)
  const pointerGrab = useSelector(({ compositor }) => compositor.seat.pointerGrab)
  if (!pointerGrabIsActive && pointerGrab) {
    compositorActions.requestActive(pointerGrab)
  }

  const userSurfaces = useSelector(({ compositor }) => Object.values(compositor.userSurfaces))
  return (
    userSurfaces.map(userSurface =>
      <UserSurface
        key={userSurface.key}
        sceneId={sceneId}
        id={userSurface.id}
        clientId={userSurface.clientId}
        active={activeUserSurfaceRef.current && activeUserSurfaceRef.current.key === userSurface.key}
      />)
  )
})

export default LocalScene
