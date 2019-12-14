import { Box, CircularProgress, Container, Grid, IconButton, makeStyles, Menu, Typography } from '@material-ui/core'
import React, { useState } from 'react'
import AppsIcon from '@material-ui/icons/Apps'
import { ApplicationLauncher } from '../../components/ApplicationLauncher'
import Link from '@material-ui/core/Link'
import { Link as RouterLink } from 'react-router-dom'

const userApplications = [
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 1,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 2,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 3,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 4,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 5,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 6,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 7,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 8,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 9,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 10,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 11,
    appURL: '',
    appType: 'web'
  },
  {
    appIconURL: `https://source.unsplash.com/random?sig=${Math.random()}`,
    appTitle: 'test',
    appId: 12,
    appURL: '',
    appType: 'web'
  }
]

const useStyles = makeStyles(theme => ({
  container: {
    minHeight: 100,
    width: '90vw'
  },
  menuPaper: {
    backgroundColor: 'rgba(0,0,0,0.5)'
  }
}))

const ApplicationLauncherTile = React.memo(({ application }) => {
  const onLaunchApplication = () => {}

  return (
    <Grid item xs={4} sm={3} md={2} lg={1} xl={1}>
      <ApplicationLauncher application={application} onLaunchApplication={onLaunchApplication} />
    </Grid>
  )
})

const UserApplications = React.memo(() => {
  // TODO app list from realtime firedatabase
  const isLoading = false

  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = event => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const WebstoreLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} {...props} />)
  return (
    <>
      <IconButton aria-controls='application-launcher-menu' aria-haspopup='true' onClick={handleClick}>
        <AppsIcon />
      </IconButton>
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{
          paper: classes.menuPaper
        }}
      >
        <Container className={classes.container} maxWidth='lg'>
          {isLoading
            ? <CircularProgress />
            : userApplications.length === 0
              ? (
                <Box width='100%' height='100%'>
                  <Typography
                    className={classes.emptyText}
                    align='center'
                    variant='h6'
                  >
                    No applications here. Visit the <Link component={WebstoreLink} to='/webstore'>Webstore</Link> and add some!
                  </Typography>
                </Box>
              )
              : <Grid container spacing={1}>{userApplications.map(application =>
                <ApplicationLauncherTile key={application.id} application={application} />)}
                </Grid>}
        </Container>
      </Menu>
    </>
  )
})

export default UserApplications
