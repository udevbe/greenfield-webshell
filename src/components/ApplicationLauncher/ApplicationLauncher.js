import React from 'react'
import { Card, CardActionArea, CardMedia, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Image from '../Image'

const useStyles = makeStyles({
  card: {
    width: 80,
    // height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  // cardMedia: {
  //   paddingTop: '100%'
  // },
  cardContent: {
    flexGrow: 1
  }
})

export const ApplicationLauncher = ({ application: { appIconURL, appTitle, appId, appURL, appType }, onLaunchApplication }) => {
  const classes = useStyles()

  return (
    <>
      <Card className={classes.card} key={appId} elevation={5}>
        <CardActionArea onClick={() => onLaunchApplication({ appIconURL, appTitle, appId, appURL, appType })}>
          <CardMedia title={appTitle}>
            <Image src={appIconURL} />
          </CardMedia>
        </CardActionArea>
      </Card>
      <Typography
        align='center'
        variant='subtitle2'
        noWrap
      >
        {appTitle}
      </Typography>
    </>
  )
}
