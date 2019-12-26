import React from 'react'
import { useFirebaseConnect } from 'react-redux-firebase'
import { CircularProgress, Grid, makeStyles } from '@material-ui/core'
import { ApplicationLauncher } from './ApplicationLauncher'
import { useSelector } from 'react-redux'

const useStyles = makeStyles(theme => ({
  root: {
    margin: 2
  }
}))

export const ApplicationLauncherTile = React.memo(({ appId }) => {
  useFirebaseConnect([{ path: `/apps/${appId}` }])
  const app = useSelector(({ firebase }) => {
    if (firebase.data.apps) {
      return firebase.data.apps[appId] || null
    }
    return null
  })

  const classes = useStyles()
  return (
    <Grid item className={classes.root}>
      {app
        ? <ApplicationLauncher application={app} />
        : <CircularProgress />}
    </Grid>
  )
})
