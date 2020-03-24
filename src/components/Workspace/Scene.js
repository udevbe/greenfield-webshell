import React, { useLayoutEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SceneTabs from './SceneTabs'
import { makeStyles } from '@material-ui/styles'
import {
  notifyUserSurfaceInactive,
  refreshScene,
  requestUserSurfaceActive,
  userSurfaceKeyboardFocus
} from '../../middleware/compositor/actions'

const useStyles = makeStyles(theme => ({
  content: {
    height: '100%',
    width: '100%',
    position: 'relative',
    float: 'left',
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexGrow: 1,
    overflow: 'hidden',
    backgroundColor: '#43464B'
  }
}))

const configureSceneElement = sceneElement => {
  sceneElement.style.display = 'inline'
  sceneElement.style.width = '100%'
  sceneElement.style.overflow = 'hidden'
  sceneElement.style.flex = 1
  sceneElement.style.order = 100
  sceneElement.style.outline = 'none'
  sceneElement.style.objectFit = 'fill'
  sceneElement.style.backgroundColor = 'black'

  return sceneElement
}

const Scene = React.memo(({ sceneId }) => {
  const dispatch = useDispatch()
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    if (sceneId === null) {
      return
    }

    const contentElement = /** @type  {HTMLElement} */contentRef.current
    const sceneElement = document.getElementById(sceneId)
    const resizeListener = () => dispatch(refreshScene(sceneId))

    if (sceneElement.parentElement !== contentElement) {
      configureSceneElement(sceneElement)
      contentElement.appendChild(sceneElement)
      dispatch(refreshScene(sceneId))
      window.addEventListener('resize', resizeListener)
    }
    sceneElement.focus()

    return () => {
      window.removeEventListener('resize', resizeListener)
      sceneElement.style.display = 'none'
      document.body.appendChild(sceneElement)
    }
  }, [contentRef, dispatch, sceneId])

  const activeUserSurfaceKeyRef = useRef(null)

  // TODO move "keyboard focus follows active surface" to middleware
  const currentActiveUserSurface = useSelector(({ compositor }) => Object.values(compositor.userSurfaces).reduce((previousValue, currentValue) => {
    if (currentValue.active && ((previousValue && currentValue.lastActive > previousValue.lastActive) || previousValue === null)) {
      return currentValue
    } else {
      return previousValue
    }
  }, null) || null)
  if (activeUserSurfaceKeyRef.current && currentActiveUserSurface && activeUserSurfaceKeyRef.current !== currentActiveUserSurface.key) {
    dispatch(notifyUserSurfaceInactive(activeUserSurfaceKeyRef.current))
    dispatch(userSurfaceKeyboardFocus(currentActiveUserSurface.key))
  } else if (activeUserSurfaceKeyRef.current && currentActiveUserSurface === null) {
    dispatch(notifyUserSurfaceInactive(activeUserSurfaceKeyRef.current))
  } else if (activeUserSurfaceKeyRef.current === null && currentActiveUserSurface) {
    dispatch(userSurfaceKeyboardFocus(currentActiveUserSurface.key))
  }
  activeUserSurfaceKeyRef.current = currentActiveUserSurface ? currentActiveUserSurface.key : null

  // TODO move "surface with pointer grab becomes active" to middleware
  const pointerGrabIsActive = useSelector(({ compositor }) => compositor.seat.pointerGrab ? compositor.userSurfaces[compositor.seat.pointerGrab].active : false)
  const pointerGrab = useSelector(({ compositor }) => compositor.seat.pointerGrab)
  if (!pointerGrabIsActive && pointerGrab) {
    dispatch(requestUserSurfaceActive(pointerGrab))
  }

  const classes = useStyles()
  return (
    <div className={classes.content} ref={contentRef}>
      <SceneTabs sceneId={sceneId} />
    </div>
  )
})

export default Scene
