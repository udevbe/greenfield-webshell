import React from 'react'
import { Card, CardActionArea, CardMedia, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Image from '../Image'

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

export const ApplicationLauncher = React.memo(({ application: { icon, title, url, type }, appId, onLaunchApplication }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <CardActionArea onClick={() => onLaunchApplication({ icon, title, url, type })}>
        <Card className={classes.card} key={appId} elevation={3}>
          <CardMedia title={title}>
            <Image src={icon} />
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
