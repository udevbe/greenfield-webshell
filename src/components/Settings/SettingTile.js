import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import CardActionArea from '@material-ui/core/CardActionArea'
import { useHistory } from 'react-router'

const useSettingTileStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  cardContent: {
    flexGrow: 1
  }
}))

const SettingTile = ({ title, description, index, icon, path }) => {
  const history = useHistory()

  const navigateTo = () => history.push(path)

  const classes = useSettingTileStyles()
  return (
    <Grid item xs={6} sm={4} md={3} lg={2} xl={2}>
      <Card className={classes.card} elevation={5}>
        <CardActionArea onClick={navigateTo}>
          {icon}
          <CardContent className={classes.cardContent}>
            <Typography gutterBottom variant='h5' align='center'>
              {title}
            </Typography>
            <Typography gutterBottom vaiant='caption' align='center'>
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )
}

export default SettingTile
