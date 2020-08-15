import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Grow from '@material-ui/core/Grow'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { push } from 'connected-react-router'
import type { FunctionComponent } from 'react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useFirebase } from 'react-redux-firebase'
import { useUserAppLinkId, useUserAppLinkIdLoading } from '../../database/hooks'
import { queryRemoveAppFromUser } from '../../database/queries'
import { useUserId } from '../../utils/auth'
import { useNotifyInfo } from '../../utils/notify'
import Image from '../Image'

const useWebAppTileStyles = makeStyles(() => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardContent: {
    flexGrow: 1,
  },
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 'auto',
    left: 'auto',
    color: 'black',
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}))

const WebAppTile: FunctionComponent<{
  appId: string
  app: { about: string; icon: string; title: string; type: string; url: string }
  index: number
}> = ({ appId, app, index }) => {
  const dispatch = useDispatch()
  const [icon, setIcon] = useState<string | undefined>(undefined)
  const firebase = useFirebase()
  const uid = useUserId()
  const userAppLinkId = useUserAppLinkId(firebase, uid, appId)
  const userAppLinkIdLoading = useUserAppLinkIdLoading(uid)
  const notifyInfo = useNotifyInfo()

  if (app && icon === null) {
    firebase
      .storage()
      .refFromURL(app.icon)
      .getDownloadURL()
      .then((iconURL: string) => setIcon(iconURL))
  }

  const removeApp = async () => {
    if (userAppLinkId) {
      await queryRemoveAppFromUser(firebase, uid, userAppLinkId)
      // TODO intl
      // TODO use application name in message
      notifyInfo('Application removed')
    }
  }

  const goToAboutApp = () => {
    dispatch(push(`/webstore/${appId}`))
  }

  const classes = useWebAppTileStyles()
  // TODO i18n
  return (
    <Grow in appear style={{ transformOrigin: '0 0 0' }} timeout={{ enter: index * 100 }}>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={2}>
        <Card className={classes.card} elevation={5}>
          <CardMedia title={app.title}>
            <Image src={icon} alt={app.title} />
          </CardMedia>
          <CardContent className={classes.cardContent}>
            <Typography gutterBottom variant="h6" align="center">
              {app.title}
            </Typography>
            <Typography gutterBottom variant="caption" align="center" />
          </CardContent>
          <CardActions>
            {userAppLinkIdLoading ? (
              <CircularProgress />
            ) : (
              <>
                <Button size="large" color="primary" onClick={() => goToAboutApp()} variant="contained">
                  Details
                </Button>
                {userAppLinkId && (
                  <Button size="large" color="primary" onClick={removeApp} variant="contained">
                    Remove
                  </Button>
                )}
              </>
            )}
          </CardActions>
        </Card>
      </Grid>
    </Grow>
  )
}

export default React.memo(WebAppTile)
