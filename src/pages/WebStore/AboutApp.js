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
import Skeleton from '@material-ui/lab/Skeleton'
import Markdown from '../../components/Markdown/Markdown'
import { fetchAppStorageProperty } from '../../utils/appStorage'

const useStyles = makeStyles({
  card: {
    marginTop: 20,
    maxWidth: 800
  }
})

const AboutApp = React.memo(() => {
  const history = useHistory()
  const { appid } = useParams()
  const [addAppBusy, setAddAppBusy] = useState(false)
  const [aboutTxt, setAboutTxt] = useState(null)
  const [icon, setIcon] = useState(null)
  const firebase = useFirebase()
  const uid = useUserId()
  const userAppLinkId = useUserAppLinkId(firebase, uid, appid)
  useFirebaseConnect([{ path: `/apps/${appid}`, storeAs: 'aboutApp' }])
  const app = useSelector(({ firebase }) => firebase.data.aboutApp || null)

  const notifySuccess = useNotifySuccess()
  const notifyInfo = useNotifyInfo()
  const notifyError = useNotifyError()

  if (app && icon === null) {
    firebase.storage().refFromURL(app.icon).getDownloadURL().then(iconURL => setIcon(iconURL))
  }

  if (app && aboutTxt === null) {
    fetchAppStorageProperty(firebase, app.about).then(aboutText => {
      setAboutTxt(aboutText)
    }).catch(error => {
      // TODO A full list of error codes is available at https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/object-not-found':
          notifyError(`${app.title} about text could not be found on server.`)
          break
        case 'storage/unauthorized':
          notifyError(`Not authorized to read about ${app.title}.`)
          break
        case 'storage/unknown':
        default:
          notifyError(`${app.title} failed to retrieve about text. ${error.message}`)
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
      isLoading={app === null}
    >
      {
        app &&
        <Container>
            <Card className={classes.card} elevation={3}>
              <CardMedia>
                <Image
                  src={icon}
                  alt={app.title}
                />
              </CardMedia>
              <CardContent className={classes.cardContent}>
                <Typography gutterBottom variant='h6' align='center'>
                  {app.title}
                </Typography>
                {
                  aboutTxt ? <Markdown>{aboutTxt}</Markdown> : <> <Skeleton /> <Skeleton /> <Skeleton /> </>
                }
              </CardContent>
              <CardActions>
                <Button
                  disabled={addAppBusy}
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
