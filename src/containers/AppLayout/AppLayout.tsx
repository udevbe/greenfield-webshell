import { makeStyles } from '@material-ui/styles'
import React, { FunctionComponent } from 'react'
import Notification from '../../components/Notification'
import UpdateNotification from '../../components/Notification/UpdateNotification'
import Drawer from '../../containers/Drawer'
import Routes from '../../containers/Routes'

const useStyles = makeStyles({
  body: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
})

export const AppLayout: FunctionComponent = () => {
  const classes = useStyles()

  return (
    <div className={classes.body}>
      <div className={classes.root}>
        <Notification />
        <UpdateNotification />
        <Drawer />
        <Routes />
      </div>
    </div>
  )
}

export default React.memo(AppLayout)
