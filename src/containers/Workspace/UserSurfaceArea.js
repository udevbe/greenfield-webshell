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
  const { actions: compositorActions } = useCompositor()

  const userSurfaces = useSelector(({ compositor }) => Object.values(compositor.userSurfaces))
  const pointerGrab = useSelector(({ compositor }) => compositor.seat.pointerGrab)
  const keyboardFocus = useSelector(({ compositor }) => compositor.seat.keyboardFocus)
  const grabbedUserSurfaceIsActive = useSelector(({ compositor }) => pointerGrab ? compositor.userSurfaces[pointerGrab.key].active : false)

  if (pointerGrab && !grabbedUserSurfaceIsActive) {
    compositorActions.requestActive(pointerGrab)
  }

  // TODO add client/surface state to see if client actually supports keyboard input at all
  if (grabbedUserSurfaceIsActive && (keyboardFocus === null || pointerGrab.key !== keyboardFocus.key)) {
    compositorActions.setKeyboardFocus(pointerGrab)
  }

  if (keyboardFocus && pointerGrab && keyboardFocus.key !== pointerGrab.key) {
    compositorActions.notifyInactive(keyboardFocus)
  }

  return (
    <div className={classes.workspace} id='workspace' ref={workspaceRef}>{
      userSurfaces.map((userSurface) =>
        <UserSurface
          key={userSurface.key} workspaceRef={workspaceRef}
          id={userSurface.id} clientId={userSurface.clientId} userSurfaceKey={userSurface.key}
        />)
    }
    </div>
  )
})

export default UserSurfaceArea
