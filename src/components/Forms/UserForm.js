import Avatar from '@material-ui/core/Avatar'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import IconButton from '@material-ui/core/IconButton'
import Person from '@material-ui/icons/Person'
import React from 'react'
import Switch from '@material-ui/core/Switch'
import Typography from '@material-ui/core/Typography'
import classNames from 'classnames'
import { FacebookIcon, GitHubIcon, GoogleIcon, TwitterIcon } from '../../components/Icons'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { makeStyles } from '@material-ui/core/styles'
import { useFirebase } from 'react-redux-firebase'
import { useIntl } from 'react-intl'

const useStyles = makeStyles(theme => ({
  avatar: {
    margin: 10
  },
  bigAvatar: {
    width: 120,
    height: 120
  },
  margin: {
    margin: theme.spacing(1)
  },
  withoutLabel: {
    marginTop: theme.spacing(1) * 3
  },
  root: {
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
}))

const UserForm = ({ handleAdminChange, isAdmin, values }) => {
  const appConfig = useAppConfig()
  const intl = useIntl()
  const auth = useFirebase().auth
  const isLinkedWithProvider = provider => {
    try {
      return (
        auth &&
        auth.providerData &&
        auth.providerData.find(p => {
          return p.providerId === provider
        }) !== undefined
      )
    } catch (e) {
      return false
    }
  }

  const getProviderIcon = p => {
    switch (p) {
      case 'google.com':
        return <GoogleIcon />

      case 'facebook.com':
        return <FacebookIcon />

      case 'twitter.com':
        return <TwitterIcon />

      case 'github.com':
        return <GitHubIcon />

      default:
        return undefined
    }
  }
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {values.photoURL && (
        <Avatar alt='' src={values.photoURL} className={classNames(classes.avatar, classes.bigAvatar)} />
      )}
      {!values.photoURL && (
        <Avatar className={classNames(classes.avatar, classes.bigAvatar)}>
          {' '}
          <Person style={{ fontSize: 60 }} />{' '}
        </Avatar>
      )}

      <div>
        {appConfig.firebase_providers.map((p, i) => {
          if (p !== 'email' && p !== 'password' && p !== 'phone') {
            return (
              <IconButton key={i} disabled={!isLinkedWithProvider(p)} color='primary'>
                {getProviderIcon(p)}
              </IconButton>
            )
          } else {
            return <div key={i} />
          }
        })}
      </div>
      <br />

      <Typography variant='h4' gutterBottom>
        {values.displayName}
      </Typography>

      <div>
        <FormControlLabel
          control={<Switch checked={isAdmin} onChange={handleAdminChange} />}
          label={intl.formatMessage({ id: 'is_admin_label' })}
        />
      </div>
    </div>
  )
}

UserForm.propTypes = {}

export default UserForm
