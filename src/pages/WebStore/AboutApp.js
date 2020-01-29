import React, { useState } from 'react'
import Activity from '../../containers/Activity'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { useHistory } from 'react-router'
import Link from '@material-ui/core/Link'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import { queryAddAppToUser, queryRemoveAppFromUser } from '../../database/queries'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { useUserId } from '../../utils/auth'
import { useUserAppLinkId } from '../../database/hooks'
import { useNotifyError, useNotifyInfo, useNotifySuccess } from '../../utils/notify'
import CardMedia from '@material-ui/core/CardMedia'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Image from '../../components/Image'
import { useSelector } from 'react-redux'

const useStyles = makeStyles({
  card: {
    marginTop: 20
  }
})

const AboutApp = React.memo(() => {
  const history = useHistory()
  const { appid } = useParams()
  const [busy, setBusy] = useState(false)
  const firebase = useFirebase()
  const uid = useUserId()
  const userAppLinkId = useUserAppLinkId(firebase, uid, appid)
  useFirebaseConnect([{ path: `/apps/${appid}`, storeAs: 'aboutApp' }])
  const app = useSelector(({ firebase }) => firebase.data.aboutApp || null)

  const notifySuccess = useNotifySuccess()
  const notifyInfo = useNotifyInfo()
  const notifyError = useNotifyError()

  const removeApp = async () => {
    await queryRemoveAppFromUser(firebase, uid, userAppLinkId)
    // TODO intl
    // TODO use application name in message
    notifyInfo('Application removed')
  }

  const addApp = async () => {
    try {
      const timer = setTimeout(() => setBusy(true), 500)
      // add
      await queryAddAppToUser(firebase, appid, uid)
      // TODO intl
      // TODO use application name in message
      notifySuccess('Application added.')
      clearTimeout(timer)
    } catch (e) {
      // TODO error in sentry.io
      // TODO i18n
      notifyError('Could not add application. Try again later.')
    }
    setBusy(false)
  }

  const goToWebStore = () => history.push('/webstore')
  const link = React.forwardRef((props, ref) =>
    <RouterLink innerRef={ref} {...props} />)
  const classes = useStyles()
  // TODO i18n
  return (
    <Activity
      pageTitle={`Greenfield - Web Store - ${appid}`}
      appBarContent={
        <>
          <IconButton onClick={goToWebStore}>
            <ArrowBackIcon fontSize='large' />
          </IconButton>
          <Breadcrumbs aria-label='breadcrumb'>
            <Link underline='hover' color='inherit' component={link} to='/webstore'>
              Web Store
            </Link>
            <Typography color='textPrimary'>
              {appid}
            </Typography>
          </Breadcrumbs>
        </>
      }
      style={{ maxHeight: '100%' }}
      isLoading={app === null}
    >
      {
        app &&
          <Container>
            <Card className={classes.card} elevation={3}>
              <CardMedia>
                <Image
                  src={app.icon}
                  alt={app.title}
                />
              </CardMedia>
              <CardContent className={classes.cardContent}>
                <Typography gutterBottom variant='h6' align='center'>
                  {app.title}
                </Typography>
                <Typography gutterBottom vaiant='caption' align='center'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
              ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  disabled={busy}
                  size='large'
                  color='primary'
                  onClick={() => { userAppLinkId ? removeApp() : addApp() }}
                  variant='contained'
                >
                  {userAppLinkId ? 'Remove' : 'Add'}
                </Button>
              </CardActions>
            </Card>
          </Container>
      }
    </Activity>
  )
})

export default AboutApp
