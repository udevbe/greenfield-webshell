import React from 'react'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import InfoIcon from '@material-ui/icons/Info'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import { amber, green, lightBlue } from '@material-ui/core/colors'
import WarningIcon from '@material-ui/icons/Warning'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import PropTypes from 'prop-types'

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
}

const useStyles = makeStyles(theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: lightBlue[600]
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 24,
    opacity: 0.9,
    flex: 'none'
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  messageText: {
    paddingLeft: 5
  }
}))

const NotificationContent = React.memo(({ message, onClose, variant, ...other }) => {
  const classes = useStyles()
  const Icon = variantIcon[variant]

  return (
    <SnackbarContent
      className={classes[variant]}
      aria-describedby='client-snackbar'
      message={
        <span id='client-snackbar' className={classes.message}>
          <Icon className={classes.icon} />
          <Typography className={classes.messageText} variant='body1' align='center'>
            {message}
          </Typography>
        </span>
      }
      action={[
        <IconButton key='close' aria-label='close' color='inherit' onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>
      ]}
      {...other}
    />
  )
})

NotificationContent.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['error', 'info', 'success', 'warning']).isRequired
}

export default NotificationContent
