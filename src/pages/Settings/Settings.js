import Activity from '../../containers/Activity'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import SettingTile from '../../components/Settings/SettingTile'
import Container from '@material-ui/core/Container'
import Keyboard from '@material-ui/icons/Keyboard'
import Flag from '@material-ui/icons/Flag'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  }
}))

const Settings = React.memo(() => {
  const classes = useStyles()
  return (
    <Activity
      pageTitle='Greenfield Settings'
      appBarTitle='Settings'
      style={{ maxHeight: '100%' }}
    >
      <Container
        className={classes.cardGrid}
        maxWidth={false}
      >
        <Grid container spacing={2}>
          <SettingTile
            index={1}
            title='Input'
            description='Keyboard Layout & Scroll speed'
            icon={<Keyboard fontSize='large' />}
            path='/settings/input'
          />
          <SettingTile
            index={2}
            title='Site'
            description='Theme & Language'
            icon={<Flag fontSize='large' />}
            path='/settings/site'
          />
        </Grid>
      </Container>
    </Activity>
  )
})

export default Settings
