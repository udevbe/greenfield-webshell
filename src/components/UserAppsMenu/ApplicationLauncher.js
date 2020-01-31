import React, { useState } from 'react'
import { Card, CardActionArea, CardMedia, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Image from '../Image'
import { useCompositor } from '../../contexts/CompositorProvider'
import { useFirebase } from 'react-redux-firebase'
import { useNotifyError } from '../../utils/notify'
import { useSelector } from 'react-redux'

const useStyles = makeStyles({
  root: {
    // TODO increase width for bigger screen (responsive)
    width: 58
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  appTitle: {
    paddingTop: 5,
    color: 'white',
    textStroke: 'thin rgba(0,0,0,0.3)'
  }
})

export const ApplicationLauncher = React.memo(({ application: { icon, title, url, type }, appId }) => {
  const [launchedClientId, setLaunchedClientId] = useState(null)
  const launchedClient = useSelector(({ compositor }) => launchedClientId ? compositor.clients[launchedClientId] : null)
  if (launchedClientId && !launchedClient) {
    setLaunchedClientId(null)
  }

  const [appIcon, setAppIcon] = useState(null)
  const compositor = useCompositor()
  const firebase = useFirebase()
  const notifyError = useNotifyError()

  if (appIcon === null) {
    firebase.storage().refFromURL(icon).getDownloadURL().then(iconURL => setAppIcon(iconURL))
  }

  const onLaunchApplication = () => {
    if (launchedClient) {
      // TODO raise this client's surfaces
      return
    }
    if (compositor.remoteAppLauncher && type === 'remote') {
      compositor.remoteAppLauncher.launch(new URL(url), appId).then(client => {
        setLaunchedClientId(client.id)
      }).catch(function (error) {
        notifyError(`${title} failed to launch. ${error.message}`)
      })
    } else if (compositor.webAppLauncher && type === 'web') {
      firebase.storage().refFromURL(url).getDownloadURL().then(downloadURL => {
        compositor.webAppLauncher.launch(new URL(downloadURL)).then(client => {
          setLaunchedClientId(client)
        })
      }).catch(function (error) {
        // TODO A full list of error codes is available at https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/object-not-found':
            notifyError(`${title} application could not be found on server.`)
            break
          case 'storage/unauthorized':
            notifyError(`Not authorized to launch ${title}.`)
            break
          case 'storage/unknown':
          default:
            notifyError(`${title} failed to launch. ${error.message}`)
            break
        }
      })
    }
  }

  const classes = useStyles()
  return (
    <div className={classes.root}>
      <CardActionArea onClick={onLaunchApplication}>
        <Card className={classes.card} key={appId} elevation={3}>
          <CardMedia title={title}>
            <Image src={appIcon} alt={title} />
          </CardMedia>
        </Card>
        <Typography
          className={classes.appTitle}
          align='center'
          variant='body2'
          gutterBottom={false}
        >
          {title}
        </Typography>
      </CardActionArea>
    </div>
  )
})
