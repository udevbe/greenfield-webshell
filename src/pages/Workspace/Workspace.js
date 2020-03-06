import React, { useRef } from 'react'
import AppsIcon from '@material-ui/icons/Apps'
import Activity from '../../containers/Activity'
import UserAppsMenu from '../../containers/UserAppsMenu'
import { useSelector } from 'react-redux'
import UserSurfaceTab from '../../components/Workspace/UserSurfaceTab'
import Tabs from '@material-ui/core/Tabs'
import { makeStyles } from '@material-ui/styles'
import Backdrop from '@material-ui/core/Backdrop'
import Typography from '@material-ui/core/Typography'
import LocalScene from '../../components/Workspace/LocalScene'
import SceneTabs from '../../components/Workspace/SceneTabs'

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
    zIndex: theme.zIndex.drawer + 1,
    boxSizing: 'border-box',
    color: '#fff',
    margin: '0 auto',
    padding: 5,
    textAlign: 'center',
    top: '90%',
    bottom: '5%'
  }
}))

const Workspace = React.memo(() => {
  const classes = useStyles()
  const mainRef = useRef(null)
  const contentRef = useRef(null)

  const compositorInitialized = useSelector(({ compositor }) => compositor.initialized)
  const userSurfaces = useSelector(({ compositor }) => Object.values(compositor.userSurfaces))
  const activeUserSurface = useSelector(({ compositor }) => Object.values(compositor.userSurfaces)
    .find(userSurface => userSurface.active))

  const activeSceneId = useSelector(({ compositor }) => compositor.activeSceneId)
  // TODO map scenes from store.

  // TODO i18n
  return (
    <Activity
      isLoading={!compositorInitialized}
      pageTitle='Greenfield - Workspace'
      appBarContent={
        <>
          <Tabs
            className={classes.tabsTop}
            variant='fullWidth'
            value={activeUserSurface ? activeUserSurface.key : false}
          >
            {
              userSurfaces.map(({ key, title }) => (
                <UserSurfaceTab
                  key={key}
                  value={key}
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
      {
        userSurfaces.length === 0 &&
        <>
            <Backdrop open className={classes.backdrop} timeout={5000} addEndListener={() => {}}>
              <Typography variant='subtitle1'>
                No applications are running. To launch an application, press the  <AppsIcon /> icon in the top right corner.
              </Typography>
            </Backdrop>
          </>
      }
      {
        <>
          <div className={classes.content} ref={contentRef}>
            <LocalScene contentRef={contentRef} sceneId={activeSceneId} />
            {/* TODO create bottom tabs bar component to create, destroy, update & switch scenes */}
            <SceneTabs />
          </div>
        </>
      }
    </Activity>
  )
})

export default Workspace
