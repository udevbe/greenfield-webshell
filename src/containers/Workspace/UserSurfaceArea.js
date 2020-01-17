import React, { useRef } from 'react'
import { useSelector } from 'react-redux'
import UserSurface from '../../components/Workspace/UserSurface'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useCompositor } from '../../contexts/CompositorProvider'

const useStyles = makeStyles(theme => ({
  workspace: {
    width: '100%',
    height: '100%',
    backgroundImage: 'url(./pattern_light.png)',
    backgroundSize: 'auto',
    backgroundRepeat: 'repeat',
    overflow: 'hidden',
    position: 'relative'
  }
}))

const UserSurfaceArea = React.memo(() => {
  const classes = useStyles()
  const workspaceRef = useRef(null)
  const activeUserSurfaceRef = useRef(null)
  const { actions: compositorActions } = useCompositor()

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
    <div className={classes.workspace} id='workspace' ref={workspaceRef}>{
      userSurfaces.map(userSurface =>
        <UserSurface
          key={userSurface.key}
          workspaceRef={workspaceRef}
          id={userSurface.id}
          clientId={userSurface.clientId}
          active={activeUserSurfaceRef.current && activeUserSurfaceRef.current.key === userSurface.key}
        />)
    }
    </div>
  )
})

export default UserSurfaceArea
