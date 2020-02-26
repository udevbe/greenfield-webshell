import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import UserSurface from '../../components/Workspace/UserSurface'
import { useCompositor } from '../../contexts/CompositorProvider'

const configureCanvas = canvas => {
  canvas.style.display = 'inline'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.overflow = 'hidden'
  canvas.style.position = 'relative'
  canvas.style.float = 'left'

  return canvas
}

const captureInputEvents = (canvas, compositorActions, sceneId) => {
  canvas.onpointermove = event => compositorActions.input.pointerMove(event, sceneId)
  canvas.onpointerdown = event => {
    canvas.setPointerCapture(event.pointerId)
    compositorActions.input.buttonDown(event, sceneId)
  }
  canvas.onpointerup = event => {
    compositorActions.input.buttonUp(event, sceneId)
    canvas.releasePointerCapture(event.pointerId)
  }
  canvas.onwheel = event => compositorActions.input.axis(event, sceneId)
}

const LocalScene = React.memo(({ mainRef, sceneId }) => {
  const { actions: compositorActions } = useCompositor()

  useEffect(() => {
    const mainElement = /** @type  {HTMLElement} */mainRef.current
    const element = document.getElementById(sceneId)

    captureInputEvents(element, compositorActions, sceneId)

    const resizeListener = () => compositorActions.refreshScene(sceneId, element)

    if (element.parentElement !== mainElement) {
      configureCanvas(element)
      mainElement.appendChild(element)
      compositorActions.refreshScene(sceneId, element)
      window.addEventListener('resize', resizeListener)
    }

    return () => {
      window.removeEventListener('resize', resizeListener)
      element.style.display = 'none'
      document.body.appendChild(element)
    }
  }, [mainRef, sceneId, compositorActions])

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
