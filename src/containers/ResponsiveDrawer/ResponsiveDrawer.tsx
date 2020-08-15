import { makeStyles, useTheme } from '@material-ui/core/styles'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import { isWidthDown } from '@material-ui/core/withWidth'
import classNames from 'classnames'
import React, { FunctionComponent, ReactNode } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { setDrawerMobileOpen } from '../../store/drawer'
import { useWidth } from '../../utils/theme'

const drawerWidth = 240

const iOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  drawerPaper: {
    height: '100vh',
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperOpen: {
    height: '100vh',
    position: 'relative',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperMinified: {
    height: '100vh',
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(1) * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(1) * 9,
    },
  },

  hide: {
    display: 'none',
  },
}))

const ResponsiveDrawer: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const classes = useStyles()
  const theme = useTheme()
  const width = useWidth(theme)
  const dispatch = useDispatch()
  const { mobileOpen, open, useMinified } = useSelector(
    ({ drawer: { mobileOpen, open, useMinified } }) => ({
      mobileOpen,
      open,
      useMinified,
    }),
    shallowEqual
  )

  const handleDrawerToggle = () => dispatch(setDrawerMobileOpen(!mobileOpen))

  const smDown = isWidthDown('sm', width)

  return (
    <div>
      <SwipeableDrawer
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
        variant={smDown ? 'temporary' : useMinified ? 'permanent' : 'persistent'}
        onClose={handleDrawerToggle}
        anchor={smDown ? undefined : theme.direction === 'rtl' ? 'right' : 'left'}
        classes={{
          paper: smDown
            ? classes.drawerPaper
            : classNames(
                classes.drawerPaperOpen,
                useMinified && classes.drawerPaperMinified,
                !useMinified && !open && classes.hide
              ),
        }}
        open={smDown ? mobileOpen : open}
        onOpen={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {children}
      </SwipeableDrawer>
    </div>
  )
}

export default React.memo(ResponsiveDrawer)
