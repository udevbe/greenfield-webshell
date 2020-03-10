import Activity from '../../containers/Activity'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import SettingTile from '../../components/Settings/SettingTile'
import Container from '@material-ui/core/Container'
import Keyboard from '@material-ui/icons/Keyboard'
import Flag from '@material-ui/icons/Flag'
import { makeStyles } from '@material-ui/core/styles'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

const useStyles = makeStyles(theme => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  }
}))

const Settings = React.memo(() => {
  const dispatch = useDispatch()
  const goToMain = () => dispatch(push('/'))

  const classes = useStyles()
  return (
    <Activity
      pageTitle='Greenfield - Settings'
      appBarContent={
        <>
          <IconButton onClick={goToMain}>
            <ArrowBackIcon fontSize='large' />
          </IconButton>
          <Breadcrumbs aria-label='breadcrumb'>
            <Typography color='textPrimary'>
            Settings
            </Typography>
          </Breadcrumbs>
        </>
      }
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
