import ArrowDropDown from '@material-ui/icons/ArrowDropDown'
import ArrowDropUp from '@material-ui/icons/ArrowDropUp'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import ChromeReaderMode from '@material-ui/icons/ChromeReaderMode'

import {
  Avatar,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
} from '@material-ui/core'
import React from 'react'
import { useIntl } from 'react-intl'
import { makeStyles, useTheme } from '@material-ui/core/styles'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { setDrawerOpen, setDrawerUseMinified } from '../../store/drawer/actions'
import { setDialogIsOpen } from '../../store/dialogs/actions'
import { isEmpty } from 'react-redux-firebase'
import { useWidth } from '../../utils/theme'

const useStyles = makeStyles(theme => ({
  paper: {
    backgroundColor: theme.palette.primary.dark,
    margin: 0,
    padding: 0
  },
  listItem: {
    color: theme.palette.primary.contrastText
  },
  icon: {
    color: theme.palette.primary.contrastText
  },
  button: {
    // width: 15
  }
}))

export const DrawerHeader = () => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const auth = useSelector(({ firebase: { auth } }) => auth, shallowEqual)
  const isAuthorized = !isEmpty(auth)
  const isDrawerOpen = useSelector(({ drawer }) => drawer.open)
  const isAuthMenu = useSelector(({ dialogs }) => !!dialogs.auth_menu)
  const theme = useTheme()
  const width = useWidth(theme)
  const classes = useStyles()
  return (
    <Paper className={classes.paper}>
      {isAuthorized && (
        <div>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar src={auth.photoURL} alt='user' />
              </ListItemAvatar>
              <Hidden smDown implementation='css'>
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => dispatch(setDrawerOpen(false))}
                  >
                    <ChromeReaderMode classes={{ root: classes.icon }} />
                  </IconButton>
                  <IconButton
                    className={classes.button}
                    onClick={() => dispatch(setDrawerUseMinified(false))}
                  >
                    {theme.direction === 'rtl' && <ChevronRight classes={{ root: classes.icon }} />}
                    {theme.direction !== 'rtl' && <ChevronLeft classes={{ root: classes.icon }} />}
                  </IconButton>
                </ListItemSecondaryAction>
              </Hidden>
            </ListItem>

            <ListItem>
              {!isDrawerOpen && width !== 'sm' && width !== 'xs' && auth.photoURL && (
                <ListItemAvatar>
                  <Avatar src={auth.photoURL} alt='person' style={{ marginLeft: -7, marginTop: 3 }} />
                </ListItemAvatar>
              )}
              <ListItemText
                classes={{ primary: classes.listItem, secondary: classes.listItem }}
                style={{
                  marginLeft: !isDrawerOpen && width !== 'sm' && width !== 'xs' && auth.photoURL ? 7 : undefined
                }}
                primary={auth.displayName}
                secondary={auth.email}
              />
              {isDrawerOpen && (
                <ListItemSecondaryAction
                  onClick={() => {
                    dispatch(setDialogIsOpen('auth_menu', !isAuthMenu))
                  }}
                >
                  <IconButton>
                    {isAuthMenu && <ArrowDropUp classes={{ root: classes.icon }} />}
                    {!isAuthMenu && <ArrowDropDown classes={{ root: classes.icon }} />}
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          </List>
        </div>
      )}

      {!isAuthorized && (
        <List>
          <ListItem>
            <ListItemText classes={{ primary: classes.listItem }} primary={intl.formatMessage({ id: 'app_name' })} />
            <Hidden smDown implementation='css'>
              <ListItemSecondaryAction>
                <IconButton
                  className={classes.button}
                  onClick={() => {
                    setDrawerUseMinified(false)
                  }}
                >
                  {theme.direction === 'rtl' && <ChevronRight classes={{ root: classes.icon }} />}
                  {theme.direction !== 'rtl' && <ChevronLeft classes={{ root: classes.icon }} />}
                </IconButton>
              </ListItemSecondaryAction>
            </Hidden>
          </ListItem>
        </List>
      )}
    </Paper>
  )
}

export default DrawerHeader
