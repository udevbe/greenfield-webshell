import React, { useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import UserSurface from '../../components/Workspace/UserSurface'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useCompositor } from '../../contexts/CompositorProvider'

const useStyles = makeStyles(theme => ({
  workspace: {
    width: '100%',
    height: '100%',
    // backgroundImage: 'url(./pattern_light.png)',
    // backgroundSize: 'auto',
    // backgroundRepeat: 'repeat',
    overflow: 'hidden',
    position: 'relative'
  }
}))

const UserSurfaceArea = React.memo(({}) => {
  const sceneId = 'main-workspace'

  const classes = useStyles()
  const { actions: compositorActions } = useCompositor()

  const workspaceRef = useCallback(htmlCanvasElement => {
    if (htmlCanvasElement !== null) {
      compositorActions.initScene(sceneId, htmlCanvasElement)
    }
  }, [])
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
    <canvas className={classes.workspace} ref={workspaceRef}>{
      userSurfaces.map(userSurface =>
        <UserSurface
          key={userSurface.key}
          sceneId={sceneId}
          id={userSurface.id}
          clientId={userSurface.clientId}
          active={activeUserSurfaceRef.current && activeUserSurfaceRef.current.key === userSurface.key}
        />)
    }
    </canvas>
  )
})

export default UserSurfaceArea
