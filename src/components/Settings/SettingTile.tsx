import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { push } from 'connected-react-router'
import React, { FunctionComponent, ReactNode } from 'react'
import { useDispatch } from 'react-redux'

const useSettingTileStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardContent: {
    flexGrow: 1,
  },
}))

const SettingTile: FunctionComponent<{
  title: string
  description: ReactNode
  index: number
  icon: ReactNode
  path: string
}> = ({ title, description, index, icon, path }) => {
  const dispatch = useDispatch()

  const navigateTo = () => dispatch(push(path))

  const classes = useSettingTileStyles()
  return (
    <Grid item xs={6} sm={4} md={3} lg={2} xl={2}>
      <Card className={classes.card} elevation={5}>
        <CardActionArea onClick={navigateTo}>
          {icon}
          <CardContent className={classes.cardContent}>
            <Typography gutterBottom variant="h5" align="center">
              {title}
            </Typography>
            <Typography gutterBottom variant="caption" align="center">
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )
}

export default React.memo(SettingTile)
