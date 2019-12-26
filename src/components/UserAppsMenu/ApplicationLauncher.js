import React, { useState } from 'react'
import { Card, CardActionArea, CardMedia, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Image from '../Image'
import { useCompositor } from '../../contexts/CompositorProvider'
import { useFirebase } from 'react-redux-firebase'
import { useNotifyError } from '../../utils/notify'

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
  const [launchedClient, setLaunchedClient] = useState(null)
  const compositor = useCompositor()
  const firebase = useFirebase()
  const notifyError = useNotifyError()
  const onLaunchApplication = () => {
    if (launchedClient) {
      // TODO raise this client's surfaces
      return
    }
    if (compositor.remoteAppLauncher && type === 'remote') {
      compositor.remoteAppLauncher.launch(new URL(url), appId).then(client => setLaunchedClient(client))
    } else if (compositor.webAppLauncher && type === 'web') {
      firebase.storage().refFromURL(url).getDownloadURL().then(downloadURL => {
        compositor.webAppLauncher.launch(new URL(downloadURL)).then(client => setLaunchedClient(client))
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
            notifyError(`Launching ${title} encountered an unknown error.`)
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
            <Image src={icon} alt={title} />
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
