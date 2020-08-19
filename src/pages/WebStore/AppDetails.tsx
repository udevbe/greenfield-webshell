import { makeStyles } from '@material-ui/core'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Link from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Skeleton from '@material-ui/lab/Skeleton'
import { push } from 'connected-react-router'
import type { ComponentProps, FunctionComponent } from 'react'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Image from '../../components/Image'
import Markdown from '../../components/Markdown/Markdown'
import Activity from '../../containers/Activity'
import { useUserAppLinkId } from '../../database/hooks'
import { queryAddAppToUser, queryRemoveAppFromUser } from '../../database/queries'
import { fetchAppStorageProperty } from '../../utils/appStorage'
import { useUserId } from '../../utils/auth'
import { useNotifyError, useNotifyInfo, useNotifySuccess } from '../../utils/notify'

const useStyles = makeStyles({
  card: {
    margin: 20,
  },
})

const WebstoreLink = React.forwardRef<HTMLElement, ComponentProps<any>>((props, ref) => (
  <RouterLink {...props} to="/webstore" innerRef={ref} />
))

const AppDetails: FunctionComponent = () => {
  const dispatch = useDispatch()
  const { appid } = useParams()
  const [addAppBusy, setAddAppBusy] = useState(false)
  const [aboutTxt, setAboutTxt] = useState<string | undefined>(undefined)
  const [icon, setIcon] = useState<string | undefined>(undefined)
  const firebase = useFirebase()
  const uid = useUserId()
  const userAppLinkId = useUserAppLinkId(firebase, uid, appid)
  useFirebaseConnect([{ path: `/apps/${appid}`, storeAs: `about/${appid}` }])
  const appIconURL = useSelector((store): string | undefined => store.firebase.data.apps?.[appid]?.icon)
  const appAboutURL = useSelector((store): string | undefined => store.firebase.data.apps?.[appid]?.about)
  const appTitle = useSelector((store): string | undefined => store.firebase.data.apps?.[appid]?.title)

  const notifySuccess = useNotifySuccess()
  const notifyInfo = useNotifyInfo()
  const notifyError = useNotifyError()

  if (appIconURL) {
    firebase
      .storage()
      .refFromURL(appIconURL)
      .getDownloadURL()
      .then((iconURL) => setIcon(iconURL))
  }

  if (appAboutURL) {
    fetchAppStorageProperty(firebase, appAboutURL)
      .then((aboutText) => {
        setAboutTxt(aboutText)
      })
      .catch((error) => {
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
    if (userAppLinkId) {
      await queryRemoveAppFromUser(firebase, uid, userAppLinkId)
      // TODO intl
      // TODO use application name in message
      notifyInfo('Application removed')
    }
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

  const goToWebStore = () => dispatch(push('/webstore'))

  const classes = useStyles()
  // TODO i18n
  return (
    <Activity
      pageTitle={`Greenfield - Web Store - ${appid}`}
      appBarContent={
        <>
          <IconButton onClick={goToWebStore}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb">
            <Link component={WebstoreLink} underline="hover" color="inherit">
              Web Store
            </Link>
            <Typography color="textPrimary">{appid}</Typography>
          </Breadcrumbs>
        </>
      }
      isLoading={appTitle === null}
    >
      {appTitle && (
        <Grid container direction="column" alignItems="center" justify="center" style={{ minHeight: '90vh' }}>
          <Grid item xs={12}>
            <Card className={classes.card} elevation={3}>
              <CardMedia
                style={{
                  maxWidth: 448,
                }}
              >
                <Image color="rgba(0,0,0,0)" src={icon} alt={appTitle} />
              </CardMedia>
              <CardContent>
                <Typography gutterBottom variant="h5" align="center">
                  {appTitle}
                </Typography>
                {aboutTxt ? (
                  <Markdown>{aboutTxt}</Markdown>
                ) : (
                  <>
                    {' '}
                    <Skeleton /> <Skeleton /> <Skeleton />{' '}
                  </>
                )}
              </CardContent>
              <Divider />

              <CardActions>
                <Button
                  disabled={addAppBusy}
                  size="large"
                  color="primary"
                  onClick={() => {
                    userAppLinkId ? removeApp() : addApp()
                  }}
                  variant="contained"
                  fullWidth
                >
                  {userAppLinkId ? 'Remove' : 'Add'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      )}
    </Activity>
  )
}

export default React.memo(AppDetails)
