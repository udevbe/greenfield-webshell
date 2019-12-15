import React from 'react'
import { Card, CardActionArea, CardMedia, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Image from '../Image'

const useStyles = makeStyles({
  card: {
    width: 80,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  cardContent: {
    flexGrow: 1
  }
})

export const ApplicationLauncher = ({ application: { icon, title, url, type }, appId, onLaunchApplication }) => {
  const classes = useStyles()

  return (
    <>
      <Card className={classes.card} key={appId} elevation={3}>
        <CardActionArea onClick={() => onLaunchApplication({ icon, title, url, type })}>
          <CardMedia title={title}>
            <Image src={icon} />
          </CardMedia>
        </CardActionArea>
      </Card>
      <Typography
        align='center'
        variant='subtitle2'
        noWrap
      >
        {title}
      </Typography>
    </>
  )
}
