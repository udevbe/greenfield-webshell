import React from 'react'
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  cardMedia: {
    paddingTop: '56.25%' // 16:9
  },
  cardContent: {
    flexGrow: 1
  }
})

export const ApplicationLauncher = ({ application: { appIconURL, appTitle, appId, appURL, appType }, onLaunchApplication }) => {
  const classes = useStyles()

  return (
    <Card className={classes.card} key={appId}>
      <CardActionArea onClick={() => onLaunchApplication({ appIconURL, appTitle, appId, appURL, appType })}>
        <CardMedia
          className={classes.cardMedia}
          image={appIconURL}
          title={appTitle}
        />
        <CardContent>
          <Typography
            align='center'
            variant='caption'
            noWrap
          >
            {appTitle}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
