import { GreenfieldIcon } from '../../components/Icons'
import Activity from '../../containers/Activity'
import Fab from '@material-ui/core/Fab'
import Home from '@material-ui/icons/Home'
import Paper from '@material-ui/core/Paper'
import type { FunctionComponent } from 'react'
import React from 'react'
import Typography from '@material-ui/core/Typography'
import { useIntl } from 'react-intl'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  icon: {
    width: 192,
    height: 192,
    color: theme.palette.secondary.main,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  paper: {
    backgroundColor: theme.palette.background.default,
    height: '100vh',
    margin: 0,
  },
  button: {
    marginTop: 20,
  },
}))

const PageNotFound: FunctionComponent = () => {
  const intl = useIntl()
  const classes = useStyles()

  return (
    <Activity>
      <Paper className={classes.paper}>
        <div className={classes.container}>
          <GreenfieldIcon className={classes.icon} />
          <Typography variant="h4">
            {intl.formatMessage({ id: 'warning_404_message' })}
          </Typography>
          <Typography variant="subtitle1">
            {intl.formatMessage({ id: 'warning_404_description' })}
          </Typography>
          <Fab
            color="secondary"
            aria-label="home"
            href="/"
            className={classes.button}
          >
            <Home />
          </Fab>
        </div>
      </Paper>
    </Activity>
  )
}

export default React.memo(PageNotFound)
