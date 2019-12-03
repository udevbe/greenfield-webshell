import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import React from 'react'
import classNames from 'classnames'
import { isWidthDown } from '@material-ui/core/withWidth'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'
import { useWidth } from '../../utils/theme'
import { setDrawerMobileOpen } from '../../store/drawer/actions'

const drawerWidth = 240

const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent)

const useStyles = makeStyles(theme => ({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  drawerPaper: {
    height: '100vh',
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'relative'
    },
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperOpen: {
    height: '100vh',
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    height: '100vh',
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(1) * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(1) * 9
    }
  },

  hide: {
    display: 'none'
  }
}))

const ResponsiveDrawer = ({ children }) => {
  const classes = useStyles()
  const theme = useTheme()
  const width = useWidth(theme)
  const dispatch = useDispatch()
  const drawer = useSelector(({ drawer }) => drawer)

  const handleDrawerToggle = () => dispatch(setDrawerMobileOpen(!drawer.mobileOpen))

  const smDown = isWidthDown('sm', width)

  return (
    <div>
      <SwipeableDrawer
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
        variant={smDown ? 'temporary' : 'permanent'}
        onClose={handleDrawerToggle}
        anchor={smDown ? undefined : theme.direction === 'rtl' ? 'right' : 'left'}
        classes={{
          paper: smDown
            ? classes.drawerPaper
            : classNames(
              classes.drawerPaperOpen,
              !drawer.open && classes.drawerPaperClose,
              !drawer.useMinified && classes.hide
            )
        }}
        open={smDown ? drawer.mobileOpen : drawer.open}
        onOpen={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
      >
        {children}
      </SwipeableDrawer>
    </div>
  )
}

ResponsiveDrawer.propTypes = {}

export default ResponsiveDrawer
