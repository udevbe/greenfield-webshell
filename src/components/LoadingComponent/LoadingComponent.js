import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.default,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  loader: {
    height: '80px'
  }
}))

export const LoadingComponent = ({ isLoading, timedOut, pastDelay, error }) => {
  const classes = useStyles()

  if (isLoading) {
    // While our other component is loading...
    if (timedOut) {
      // In case we've timed out loading our other component.
      return <div>Loader timed out!</div>
    } else if (pastDelay) {
      return (
        <div className={classes.container}>
          <CircularProgress />
        </div>
      )
    } else {
      // Don't flash "Loading..." when we don't need to.
      return null
    }
  } else if (error) {
    console.warn(error)
    // If we aren't loading, maybe
    return <div>Error! Component failed to load</div>
  } else {
    // This case shouldn't happen... but we'll return null anyways.
    return null
  }
}

export default LoadingComponent
