import React, { useState } from 'react'
import { useFirebase } from 'react-redux-firebase'
import { useUserId } from '../../utils/auth'
import { useUserAppLinkId, useUserAppLinkIdLoading } from '../../database/hooks'
import { queryRemoveAppFromUser } from '../../database/queries'
import { useNotifyInfo } from '../../utils/notify'
import Typography from '@material-ui/core/Typography'
import Grow from '@material-ui/core/Grow'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CircularProgress from '@material-ui/core/CircularProgress'
import CardMedia from '@material-ui/core/CardMedia'
import Image from '../Image'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

const useWebAppTileStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  cardContent: {
    flexGrow: 1
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
    justifyContent: 'center'
  }
}))

const WebAppTile = React.memo(({ appId, app, index }) => {
  const dispatch = useDispatch()
  const [icon, setIcon] = useState(null)
  const firebase = useFirebase()
  const uid = useUserId()
  const userAppLinkId = useUserAppLinkId(firebase, uid, appId)
  const userAppLinkIdLoading = useUserAppLinkIdLoading(uid)
  const notifyInfo = useNotifyInfo()

  if (app && icon === null) {
    firebase.storage().refFromURL(app.icon).getDownloadURL().then(iconURL =>
      setIcon(iconURL)
    )
  }

  const removeApp = async () => {
    await queryRemoveAppFromUser(firebase, uid, userAppLinkId)
    // TODO intl
    // TODO use application name in message
    notifyInfo('Application removed')
  }

  const goToAboutApp = () => { dispatch(push(`/webstore/${appId}`)) }

  const classes = useWebAppTileStyles()
  // TODO i18n
  return (
    <Grow in appear style={{ transformOrigin: '0 0 0' }} timeout={{ enter: index * 100 }}>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={2}>
        <Card className={classes.card} elevation={5}>
          <CardMedia
            title={app.title}
          >
            <Image src={icon} alt={app.title} />
          </CardMedia>
          <CardContent className={classes.cardContent}>
            <Typography gutterBottom variant='h6' align='center'>
              {app.title}
            </Typography>
            <Typography gutterBottom vaiant='caption' align='center' />
          </CardContent>
          <CardActions>
            {
              userAppLinkIdLoading
                ? <CircularProgress />
                : <>
                  <Button
                    size='large'
                    color='primary'
                    onClick={() => goToAboutApp()}
                    variant='contained'
                  >
                    Details
                  </Button>
                  {
                    userAppLinkId &&
                      <Button
                        size='large'
                        color='primary'
                        onClick={removeApp}
                        variant='contained'
                      >
                        Remove
                      </Button>
                  }
                </>
            }
          </CardActions>
        </Card>
      </Grid>
    </Grow>
  )
})

export default WebAppTile
