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

export const LoadingComponent = () => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <CircularProgress />
    </div>
  )
}

export default LoadingComponent
