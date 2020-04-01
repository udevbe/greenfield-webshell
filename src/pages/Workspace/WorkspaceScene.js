import React, { useRef } from 'react'
import AppsIcon from '@material-ui/icons/Apps'
import Activity from '../../containers/Activity'
import UserAppsMenu from '../../containers/UserAppsMenu'
import { useDispatch, useSelector } from 'react-redux'
import UserSurfaceTab from '../../components/Workspace/UserSurfaceTab'
import Tabs from '@material-ui/core/Tabs'
import { makeStyles } from '@material-ui/styles'
import Backdrop from '@material-ui/core/Backdrop'
import Typography from '@material-ui/core/Typography'
import Scene from '../../components/Workspace/Scene'
import { useParams } from 'react-router'
import { markSceneLastActive } from '../../store/compositor'
import { Link } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  tabsTop: {
    flex: '1 1 auto'
  },
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
    overflow: 'hidden'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer - 1,
    boxSizing: 'border-box',
    color: '#fff',
    margin: '0 auto',
    padding: 5,
    textAlign: 'center',
    top: '45%',
    height: 80
  }
}))

const WorkspaceScene = React.memo(() => {
  const { sceneId } = useParams()
  const dispatch = useDispatch()

  const compositorInitialized = useSelector(({ compositor }) => compositor.initialized)
  const sceneSurfaceKeys = useSelector(({ compositor }) => compositor.scenes[sceneId].views.map(userSurfaceView => userSurfaceView.userSurfaceKey))
  const sceneUserSurfaces = useSelector(({ compositor }) => Object.values(compositor.userSurfaces).filter(userSurface => sceneSurfaceKeys.includes(userSurface.key)))

  const activeSceneUserSurface = sceneUserSurfaces.find(userSurface => userSurface.active)
  const sceneExists = useSelector(({ compositor }) => compositor.scenes[sceneId] != null)
  const lastActiveSceneId = useSelector(({ compositor }) => {
    if (sceneExists) {
      return Object.values(compositor.scenes).reduce((previousValue, currentValue) => previousValue.lastActive > currentValue.lastActive ? previousValue : currentValue).id
    } else {
      return null
    }
  })

  if (sceneExists && lastActiveSceneId !== sceneId) {
    dispatch(markSceneLastActive({ sceneId, lastActive: Date.now() }))
  }

  // TODO i18n
  const mainRef = useRef(null)
  const classes = useStyles()
  return (
    <Activity
      isLoading={!compositorInitialized}
      pageTitle='Greenfield - Workspace'
      appBarContent={
        <>
          <Tabs
            className={classes.tabsTop}
            variant='fullWidth'
            value={activeSceneUserSurface ? activeSceneUserSurface.key : false}
          >
            {
              sceneUserSurfaces.map(({ key, title }) => {
                return (
                  <UserSurfaceTab
                    key={key}
                    value={key}
                    userSurfaceTitle={title}
                  />
                )
              })
            }
          </Tabs>
          <UserAppsMenu anchorElRef={mainRef} />
        </>
      }
      mainRef={mainRef}
    >
      {
        sceneExists && sceneUserSurfaces.length === 0 &&
        (
          <Backdrop open className={classes.backdrop} timeout={5000} addEndListener={() => {}}>
            <Typography variant='subtitle1'>
              No applications are running. To launch an application, press the  <AppsIcon /> icon in the top right corner.
            </Typography>
          </Backdrop>
        )
      }
      {
        !sceneExists &&
        (
          <Backdrop open className={classes.backdrop} timeout={1000} addEndListener={() => {}}>
            <Typography variant='subtitle1'>
              Scene does not exist. <Link to='/workspace'>Go back.</Link>
            </Typography>
          </Backdrop>
        )
      }
      {/* TODO render all scenes stacked and update order using the scene tabs. This fixes the flash when creating a new scene. */}
      {sceneExists && <Scene sceneId={sceneId} />}
    </Activity>
  )
})

export default WorkspaceScene
