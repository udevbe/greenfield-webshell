import {
  Box,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  makeStyles,
  Menu,
  Typography,
} from '@material-ui/core'
import type { ComponentProps, FunctionComponent, RefObject } from 'react'
import React, { useState } from 'react'
import AppsIcon from '@material-ui/icons/Apps'
import Link from '@material-ui/core/Link'
import { Link as RouterLink } from 'react-router-dom'
import { useUserId } from '../../utils/auth'
import { useUserAppIds, useUserAppsLoading } from '../../database/hooks'
import { useFirebase } from 'react-redux-firebase'
import { ApplicationLauncherTile } from '../../components/UserAppsMenu'

const useStyles = makeStyles(() => ({
  container: {
    minHeight: 100,
  },
  menuPaper: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  noAppsText: {
    color: 'white',
    textStroke: 'thin rgba(0,0,0,0.6)',
  },
}))

const WebstoreLink = React.forwardRef<HTMLElement, ComponentProps<any>>(
  (props, ref) => <RouterLink {...props} to="/webstore" innerRef={ref} />
)

const UserAppsMenu: FunctionComponent<{
  anchorElRef: RefObject<HTMLElement>
}> = ({ anchorElRef }) => {
  const firebase = useFirebase()
  const uid: string = useUserId()
  const userAppIds: string[] = useUserAppIds(firebase, uid)
  const isLoading: boolean = useUserAppsLoading(uid)

  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleClick = () => setAnchorEl(anchorElRef.current)
  const handleClose = () => setAnchorEl(null)

  return (
    <>
      <IconButton
        aria-controls="application-launcher-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <AppsIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        getContentAnchorEl={null}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 0,
          horizontal: 'right',
        }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{
          paper: classes.menuPaper,
        }}
      >
        <Container
          className={classes.container}
          maxWidth="lg"
          onClick={handleClose}
        >
          {isLoading ? (
            <CircularProgress />
          ) : userAppIds.length === 0 ? (
            <Box width="100%" height="100%">
              <Typography
                align="center"
                variant="h6"
                className={classes.noAppsText}
              >
                {/* TODO intl */}
                No applications here. Visit the{' '}
                <Link
                  component={WebstoreLink}
                  underline="always"
                  color="inherit"
                >
                  Webstore
                </Link>{' '}
                and add some!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2} alignItems="stretch">
              {userAppIds.map((id) => (
                <ApplicationLauncherTile key={id} id={id} />
              ))}
            </Grid>
          )}
        </Container>
      </Menu>
    </>
  )
}

export default React.memo(UserAppsMenu)
