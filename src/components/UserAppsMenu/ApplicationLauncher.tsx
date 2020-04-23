import React, { useState } from 'react'
import { Card, CardActionArea, CardMedia, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Image from '../Image'
import { useFirebase } from 'react-redux-firebase'
import { useDispatch } from 'react-redux'
import {
  launchRemoteAppAction,
  launchWebAppAction,
} from '../../middleware/compositor/actions'

const useStyles = makeStyles({
  root: {
    // TODO increase width for bigger screen (responsive)
    width: 58,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  appTitle: {
    paddingTop: 5,
    color: 'white',
    textStroke: 'thin rgba(0,0,0,0.3)',
  },
})

export const ApplicationLauncher = React.memo<{
  application: { icon: string; title: string; type: string; url: string }
  id: string
}>(({ application, id }) => {
  const { icon, title, type, url } = application
  const [appIcon, setAppIcon] = useState<string>()
  const dispatch = useDispatch()
  const firebase = useFirebase()

  if (appIcon == null) {
    firebase
      .storage()
      .refFromURL(icon)
      .getDownloadURL()
      .then((iconURL: string) => setAppIcon(iconURL))
  }

  const onLaunchApplication = () => {
    if (type === 'remote') {
      dispatch(launchRemoteAppAction({ application, id }))
    } else if (type === 'web') {
      firebase
        .storage()
        .refFromURL(url)
        .getDownloadURL()
        .then((downloadURL) =>
          dispatch(launchWebAppAction({ application, downloadURL }))
        )
    }
  }

  const classes = useStyles()
  return (
    <div className={classes.root}>
      <CardActionArea onClick={onLaunchApplication}>
        <Card className={classes.card} key={id} elevation={3}>
          <CardMedia title={title}>
            <Image src={appIcon || ''} alt={title} />
          </CardMedia>
        </Card>
        <Typography
          className={classes.appTitle}
          align="center"
          variant="body2"
          gutterBottom={false}
        >
          {title}
        </Typography>
      </CardActionArea>
    </div>
  )
})
