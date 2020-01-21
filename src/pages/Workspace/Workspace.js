import React, { useRef } from 'react'
import Activity from '../../containers/Activity'
import UserAppsMenu from '../../containers/UserAppsMenu'
import { useSelector } from 'react-redux'
import UserSurfaceArea from '../../containers/Workspace/UserSurfaceArea'
import UserSurfaceTab from '../../components/Workspace/UserSurfaceTab'
import Tabs from '@material-ui/core/Tabs'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  grow: {
    flex: '1 1 auto'
  }
}))

const Workspace = React.memo(() => {
  const classes = useStyles()
  const mainRef = useRef(null)
  const compositorInitialized = useSelector(({ compositor }) => compositor.initialized)
  const userSurfaces = useSelector(({ compositor }) => Object.values(compositor.userSurfaces))
  const activeUserSurface = useSelector(({ compositor }) => Object.values(compositor.userSurfaces)
    .find(userSurface => userSurface.active))
  return (
    <Activity
      isLoading={!compositorInitialized}
      pageTitle='Greenfield'
      appBarContent={
        <>
          <Tabs
            className={classes.grow}
            variant='fullWidth'
            value={activeUserSurface ? activeUserSurface.key : false}
          >
            {
              userSurfaces.map(({ key, id, clientId, title }) => (
                <UserSurfaceTab
                  key={key}
                  value={key}
                  userSurfaceId={id}
                  clientId={clientId}
                  userSurfaceTitle={title}
                />
              ))
            }
          </Tabs>
          <UserAppsMenu anchorElRef={mainRef} />
        </>
      }
      mainRef={mainRef}
    >
      <UserSurfaceArea />
    </Activity>
  )
})

export default Workspace
