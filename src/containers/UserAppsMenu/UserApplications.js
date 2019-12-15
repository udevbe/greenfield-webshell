import { Box, CircularProgress, Container, Grid, IconButton, makeStyles, Menu, Typography } from '@material-ui/core'
import React, { useState } from 'react'
import AppsIcon from '@material-ui/icons/Apps'
import { ApplicationLauncher } from '../../components/ApplicationLauncher'
import Link from '@material-ui/core/Link'
import { Link as RouterLink } from 'react-router-dom'
import { useUserId } from '../../utils/auth'
import { useUserAppIds, useUserAppsLoading } from '../../database/hooks'
import { useFirebase } from 'react-redux-firebase'
import { queryApp } from '../../database/queries'

const useStyles = makeStyles(theme => ({
  container: {
    minHeight: 100,
    width: '90vw'
  },
  menuPaper: {
    backgroundColor: 'rgba(0,0,0,0.5)'
  }
}))

const ApplicationLauncherTile = React.memo(({ appId }) => {
  const firebase = useFirebase()
  const [app, setApp] = useState(null)
  queryApp(firebase, appId).then(app => setApp(app))
  const onLaunchApplication = () => {}

  return (
    <Grid item xs={4} sm={3} md={2} lg={1} xl={1}>
      {app
        ? <ApplicationLauncher application={app} onLaunchApplication={onLaunchApplication} />
        : <CircularProgress />}
    </Grid>
  )
})

const WebstoreLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} {...props} />)

const UserApplications = React.memo(() => {
  // TODO app list from realtime firedatabase
  const firebase = useFirebase()
  const uid = useUserId()
  const userAppIds = useUserAppIds(firebase, uid)
  const isLoading = useUserAppsLoading(firebase, uid)

  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = event => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  return (
    <>
      <IconButton aria-controls='application-launcher-menu' aria-haspopup='true' onClick={handleClick}>
        <AppsIcon />
      </IconButton>
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{
          paper: classes.menuPaper
        }}
      >
        <Container className={classes.container} maxWidth='lg'>
          {isLoading
            ? <CircularProgress />
            : userAppIds.length === 0
              ? (
                <Box width='100%' height='100%'>
                  <Typography
                    className={classes.emptyText}
                    align='center'
                    variant='h6'
                  >
                    No applications here. Visit the <Link component={WebstoreLink} to='/webstore'>Webstore</Link> and add some!
                  </Typography>
                </Box>
              )
              : <Grid container spacing={1}>{userAppIds.map(appId =>
                <ApplicationLauncherTile
                  key={appId} appId={appId}
                />)}
              </Grid>}
        </Container>
      </Menu>
    </>
  )
})

export default UserApplications
