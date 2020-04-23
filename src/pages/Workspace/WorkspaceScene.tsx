import Backdrop from '@material-ui/core/Backdrop'
import Tabs from '@material-ui/core/Tabs'
import Typography from '@material-ui/core/Typography'
import AppsIcon from '@material-ui/icons/Apps'
import { makeStyles } from '@material-ui/core/styles'
import type { FunctionComponent } from 'react'
import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import Scene from '../../components/Workspace/Scene'
import UserSurfaceTab from '../../components/Workspace/UserSurfaceTab'
import Activity from '../../containers/Activity'
import UserAppsMenu from '../../containers/UserAppsMenu'
import { markSceneLastActive } from '../../middleware/compositor/actions'
import type { UserShellSurfaceKey } from '../../middleware/compositor/CompositorApi'
import type {
  UserShellScene,
  UserShellSurface,
  UserShellSurfaceView,
} from '../../store/compositor'

const useStyles = makeStyles((theme) => ({
  tabsTop: {
    flex: '1 1 auto',
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
    overflow: 'hidden',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer - 1,
    boxSizing: 'border-box',
    color: '#fff',
    margin: '0 auto',
    padding: 5,
    textAlign: 'center',
    top: '45%',
    height: 80,
  },
}))

const WorkspaceScene: FunctionComponent = () => {
  const { id } = useParams()
  if (id == null) {
    throw new Error('Scene id must be set.')
  }

  const scene: Pick<UserShellScene, 'id'> = { id }
  const dispatch = useDispatch()

  const compositorInitialized = useSelector(
    ({ compositor }) => compositor.initialized
  )
  const sceneSurfaceKeys: UserShellSurfaceKey[] = useSelector(
    ({ compositor }) =>
      compositor.scenes[scene.id]?.views.map(
        (view: UserShellSurfaceView) => view.surfaceKey
      ) ?? []
  )
  const sceneSurfaces: UserShellSurface[] = useSelector(({ compositor }) =>
    Object.values<UserShellSurface>(
      compositor.surfaces
    ).filter((surface: UserShellSurface) =>
      sceneSurfaceKeys.includes(surface.key)
    )
  )

  const activeSceneUserSurface = sceneSurfaces.find(
    (userSurface) => userSurface.active
  )
  const sceneExists = useSelector(
    ({ compositor }) => compositor.scenes[id] != null
  )
  const lastActiveSceneId = useSelector(({ compositor }) => {
    if (sceneExists) {
      return Object.values<UserShellScene>(
        compositor.scenes
      ).reduce((previousValue, currentValue) =>
        previousValue.lastActive > currentValue.lastActive
          ? previousValue
          : currentValue
      ).id
    } else {
      return null
    }
  })

  if (sceneExists && lastActiveSceneId !== id) {
    dispatch(markSceneLastActive({ id }))
  }

  // TODO i18n
  const mainRef = useRef<HTMLElement>(null)
  const classes = useStyles()
  return (
    <Activity
      isLoading={!compositorInitialized}
      pageTitle="Greenfield - Workspace"
      appBarContent={
        <>
          <Tabs
            className={classes.tabsTop}
            variant="fullWidth"
            value={activeSceneUserSurface ? activeSceneUserSurface.key : false}
          >
            {sceneSurfaces.map((surface) => {
              return <UserSurfaceTab key={surface.key} surface={surface} />
            })}
          </Tabs>
          <UserAppsMenu anchorElRef={mainRef} />
        </>
      }
      mainRef={mainRef}
    >
      {sceneExists && sceneSurfaces.length === 0 && (
        <Backdrop
          open
          className={classes.backdrop}
          timeout={5000}
          addEndListener={() => {}}
        >
          <Typography variant="subtitle1">
            No applications are running. To launch an application, press the{' '}
            <AppsIcon /> icon in the top right corner.
          </Typography>
        </Backdrop>
      )}
      {!sceneExists && (
        <Backdrop
          open
          className={classes.backdrop}
          timeout={1000}
          addEndListener={() => {}}
        >
          <Typography variant="subtitle1">
            Scene does not exist. <Link to="/workspace">Go back.</Link>
          </Typography>
        </Backdrop>
      )}
      {/* TODO render all scenes stacked and update order using the scene tabs. This fixes the flash when creating a new scene. */}
      {sceneExists && <Scene scene={scene} />}
    </Activity>
  )
}

export default React.memo(WorkspaceScene)
