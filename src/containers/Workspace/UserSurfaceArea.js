import React, { useRef } from 'react'
import { useSelector } from 'react-redux'
import UserSurface from '../../components/Workspace/UserSurface'
import makeStyles from '@material-ui/core/styles/makeStyles'

const useStyles = makeStyles(theme => ({
  workspace: {
    width: '100%',
    height: '100%',
    backgroundImage: 'url(./pattern_light.png)'
  }
}))

const UserSurfaceArea = () => {
  const classes = useStyles()
  const workspaceRef = useRef(null)
  const allUserSurfaces = useSelector(({ compositor }) =>
    Object.values(compositor.clients).reduce((allUserSurfaces, client) =>
      allUserSurfaces.concat(Object.values(client.userSurfaces)), []))

  return (
    <div className={classes.workspace} id='workspace' ref={workspaceRef}>{
      allUserSurfaces.map((userSurface) =>
        <UserSurface
          key={`${userSurface.clientId}::${userSurface.id}`}
          workspaceRef={workspaceRef}
          userSurface={userSurface}
        />)
    }
    </div>
  )
}

export default UserSurfaceArea
