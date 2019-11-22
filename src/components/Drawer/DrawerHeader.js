import { ArrowDropDown, ArrowDropUp, ChevronLeft, ChevronRight, ChromeReaderMode, Person } from '@material-ui/icons'
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
  useMediaQuery
} from '@material-ui/core'
import React from 'react'
import { useIntl } from 'react-intl'
import { makeStyles, useTheme } from '@material-ui/core/styles'

import { useDispatch, useSelector } from 'react-redux'
import { setDrawerOpen, setDrawerUseMinified } from '../../store/drawer/actions'
import { setDialogIsOpen } from '../../store/dialogs/actions'

/**
 * Be careful using this hook. It only works because the number of
 * breakpoints in theme is static. It will break once you change the number of
 * breakpoints. See https://reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
 */
function useWidth (theme) {
  const keys = [...theme.breakpoints.keys].reverse()
  return (
    keys.reduce((output, key) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const matches = useMediaQuery(theme.breakpoints.up(key))
      return !output && matches ? key : output
    }, null) || 'xs'
  )
}

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

export const DrawerHeader = ({ dialogs, drawer }) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const auth = useSelector(({ firebase: { auth } }) => auth)
  const theme = useTheme()
  const width = useWidth(theme)
  const classes = useStyles()
  return (
    <Paper className={classes.paper}>
      {auth.isAuthorised && (
        <div>
          <List>
            <ListItem>
              {auth.photoURL && (
                <ListItemAvatar>
                  <Avatar src={auth.photoURL} alt='user' />
                </ListItemAvatar>
              )}
              {!auth.photoURL && (
                <ListItemAvatar>
                  <Avatar>
                    {' '}
                    <Person />{' '}
                  </Avatar>
                </ListItemAvatar>
              )}
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

            <ListItem onClick={() => dispatch(setDialogIsOpen('auth_menu', !dialogs.auth_menu))}>
              {!drawer.open && width !== 'sm' && width !== 'xs' && auth.photoURL && (
                <ListItemAvatar>
                  <Avatar src={auth.photoURL} alt='person' style={{ marginLeft: -7, marginTop: 3 }} />
                </ListItemAvatar>
              )}

              {!drawer.open && width !== 'sm' && width !== 'xs' && !auth.photoURL && (
                <ListItemAvatar>
                  <Avatar style={{ marginLeft: -7, marginTop: 3 }}>
                    {' '}
                    <Person />{' '}
                  </Avatar>
                </ListItemAvatar>
              )}

              <ListItemText
                classes={{ primary: classes.listItem, secondary: classes.listItem }}
                style={{
                  marginLeft: !drawer.open && width !== 'sm' && width !== 'xs' && auth.photoURL ? 7 : undefined
                }}
                primary={auth.displayName}
                secondary={auth.email}
              />
              {drawer.open && (
                <ListItemSecondaryAction
                  onClick={() => {
                    setDialogIsOpen('auth_menu', !dialogs.auth_menu)
                  }}
                >
                  <IconButton>
                    {dialogs.auth_menu && <ArrowDropUp classes={{ root: classes.icon }} />}
                    {!dialogs.auth_menu && <ArrowDropDown classes={{ root: classes.icon }} />}
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          </List>
        </div>
      )}

      {!auth.isAuthorised && (
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
