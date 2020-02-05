import React, { useState } from 'react'
import Activity from '../../containers/Activity'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Typography from '@material-ui/core/Typography'
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
import Skeleton from '@material-ui/lab/Skeleton'
import Markdown from '../../components/Markdown/Markdown'
import { fetchAppStorageProperty } from '../../utils/appStorage'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'

const useStyles = makeStyles({
  card: {
    margin: 20
  }
})

const AppDetails = React.memo(() => {
  const history = useHistory()
  const { appid } = useParams()
  const [addAppBusy, setAddAppBusy] = useState(false)
  const [aboutTxt, setAboutTxt] = useState(null)
  const [icon, setIcon] = useState(null)
  const firebase = useFirebase()
  const uid = useUserId()
  const userAppLinkId = useUserAppLinkId(firebase, uid, appid)
  useFirebaseConnect([{ path: `/apps/${appid}`, storeAs: `about/${appid}` }])
  const appIconURL = useSelector(({ firebase }) => {
    if (firebase.data.about && firebase.data.about[appid]) {
      return firebase.data.about[appid].icon
    } else {
      return null
    }
  })
  const appAboutURL = useSelector(({ firebase }) => {
    if (firebase.data.about && firebase.data.about[appid]) {
      return firebase.data.about[appid].about
    } else {
      return null
    }
  })
  const appTitle = useSelector(({ firebase }) => {
    if (firebase.data.about && firebase.data.about[appid]) {
      return firebase.data.about[appid].title
    } else {
      return null
    }
  })

  const notifySuccess = useNotifySuccess()
  const notifyInfo = useNotifyInfo()
  const notifyError = useNotifyError()

  if (appIconURL) {
    firebase.storage().refFromURL(appIconURL).getDownloadURL().then(iconURL => setIcon(iconURL))
  }

  if (appAboutURL) {
    fetchAppStorageProperty(firebase, appAboutURL).then(aboutText => {
      setAboutTxt(aboutText)
    }).catch(error => {
      // TODO A full list of error codes is available at https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/object-not-found':
          notifyError(`${appTitle} about text could not be found on server.`)
          break
        case 'storage/unauthorized':
          notifyError(`Not authorized to read about ${appTitle}.`)
          break
        case 'storage/unknown':
        default:
          notifyError(`${appTitle} failed to retrieve about text. ${error.message}`)
          break
      }
    })
  }

  const removeApp = async () => {
    await queryRemoveAppFromUser(firebase, uid, userAppLinkId)
    // TODO intl
    // TODO use application name in message
    notifyInfo('Application removed')
  }

  const addApp = async () => {
    try {
      const timer = setTimeout(() => setAddAppBusy(true), 500)
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
    setAddAppBusy(false)
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
      isLoading={appTitle === null}
    >
      {
        appTitle &&
          <Grid
            container
            spacing={2}
            direction='column'
            alignItems='center'
            justify='center'
            style={{ minHeight: '90vh' }}
          >
            <Grid item xs={12}>
              <Card className={classes.card} elevation={3}>
                <CardMedia style={{
                  maxWidth: 448
                }}
                >
                  <Image
                    color='rgba(0,0,0,0)'
                    src={icon}
                    alt={appTitle}
                  />
                </CardMedia>
                <CardContent className={classes.cardContent}>
                  <Typography gutterBottom variant='h5' align='center'>
                    {appTitle}
                  </Typography>
                  {
                    aboutTxt ? <Markdown>{aboutTxt}</Markdown> : <> <Skeleton /> <Skeleton /> <Skeleton /> </>
                  }
                </CardContent>
                <Divider />

                <CardActions>
                  <Button
                    disabled={addAppBusy}
                    size='large'
                    color='primary'
                    onClick={() => { userAppLinkId ? removeApp() : addApp() }}
                    variant='contained'
                    fullWidth
                  >
                    {userAppLinkId ? 'Remove' : 'Add'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
      }
    </Activity>
  )
})

export default AppDetails
