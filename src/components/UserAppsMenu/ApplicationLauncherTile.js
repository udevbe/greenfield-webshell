import React from 'react'
import { useFirebaseConnect } from 'react-redux-firebase'
import { CircularProgress, Grid, makeStyles } from '@material-ui/core'
import { ApplicationLauncher } from './ApplicationLauncher'
import { useSelector } from 'react-redux'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 2,
  },
}))

export const ApplicationLauncherTile = React.memo(({ id }) => {
  useFirebaseConnect([{ path: `/apps/${id}` }])
  const application = useSelector(({ firebase }) => {
    if (firebase.data.apps) {
      return firebase.data.apps[id] || null
    }
    return null
  })

  const classes = useStyles()
  return (
    <Grid item className={classes.root}>
      {application ? (
        <ApplicationLauncher application={application} id={id} />
      ) : (
        <CircularProgress />
      )}
    </Grid>
  )
})
