import React, { useState } from 'react'
import { useFirebase } from 'react-redux-firebase'
import { queryApp } from '../../database/queries'
import { CircularProgress, Grid, makeStyles } from '@material-ui/core'
import { ApplicationLauncher } from './ApplicationLauncher'

const useStyles = makeStyles(theme => ({
  root: {
    margin: 2
  }
}))

export const ApplicationLauncherTile = React.memo(({ appId }) => {
  const firebase = useFirebase()
  const [app, setApp] = useState(null)
  queryApp(firebase, appId).then(app => setApp(app))
  const onLaunchApplication = () => {}

  const classes = useStyles()
  return (
    <Grid item className={classes.root}>
      {app
        ? <ApplicationLauncher application={app} onLaunchApplication={onLaunchApplication} />
        : <CircularProgress />}
    </Grid>
  )
})
