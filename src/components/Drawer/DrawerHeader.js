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
import { makeStyles, useTheme } from '@material-ui/core/styles'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import {
  setDrawerOpen,
  setDrawerPath,
  setDrawerUseMinified,
} from '../../store/drawer'
import { useWidth } from '../../utils/theme'

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.primary.dark,
    margin: 0,
    padding: 0,
  },
  listItem: {
    color: theme.palette.primary.contrastText,
  },
  icon: {
    color: theme.palette.primary.contrastText,
  },
  button: {
    // width: 15
  },
}))

export const DrawerHeader = React.memo(() => {
  const dispatch = useDispatch()
  const { photoURL, displayName, email } = useSelector(
    ({
      firebase: {
        auth: { photoURL, displayName, email },
      },
    }) => ({
      photoURL,
      displayName,
      email,
    }),
    shallowEqual
  )
  const notMinified = useSelector(({ drawer }) => !drawer.useMinified)
  const isAuthMenu = useSelector(({ dialogs }) => !!dialogs.auth_menu)
  const theme = useTheme()
  const width = useWidth(theme)
  const classes = useStyles()
  return (
    <Paper className={classes.paper}>
      <div>
        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar src={photoURL} alt="user" />
            </ListItemAvatar>
            <Hidden smDown implementation="css">
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => dispatch(setDrawerUseMinified(true))}
                >
                  <ChromeReaderMode classes={{ root: classes.icon }} />
                </IconButton>
                <IconButton
                  className={classes.button}
                  onClick={() => dispatch(setDrawerOpen(false))}
                >
                  {theme.direction === 'rtl' && (
                    <ChevronRight classes={{ root: classes.icon }} />
                  )}
                  {theme.direction !== 'rtl' && (
                    <ChevronLeft classes={{ root: classes.icon }} />
                  )}
                </IconButton>
              </ListItemSecondaryAction>
            </Hidden>
          </ListItem>

          <ListItem>
            {!notMinified && width !== 'sm' && width !== 'xs' && photoURL && (
              <ListItemAvatar>
                <Avatar
                  src={photoURL}
                  alt="person"
                  style={{ marginLeft: -7, marginTop: 3 }}
                />
              </ListItemAvatar>
            )}
            <ListItemText
              classes={{
                primary: classes.listItem,
                secondary: classes.listItem,
              }}
              style={{
                marginLeft:
                  !notMinified && width !== 'sm' && width !== 'xs' && photoURL
                    ? 7
                    : undefined,
              }}
              primary={displayName}
              secondary={email}
            />
            {notMinified && (
              <ListItemSecondaryAction
                onClick={() => dispatch(setDrawerPath(['user']))}
              >
                <IconButton>
                  {isAuthMenu && (
                    <ArrowDropUp classes={{ root: classes.icon }} />
                  )}
                  {!isAuthMenu && (
                    <ArrowDropDown classes={{ root: classes.icon }} />
                  )}
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        </List>
      </div>
    </Paper>
  )
})

export default DrawerHeader
