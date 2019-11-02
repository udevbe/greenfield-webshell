import * as firebaseui from 'firebaseui'
import AuthUI from '../../containers/AuthUI/AuthUI'
import React from 'react'
import * as PropTypes from 'prop-types'
import { withAppConfigs } from '../../contexts/AppConfigProvider'
import { withFirebase } from 'firekit-provider'
import { withStyles } from '@material-ui/core'
import Logo from '../../components/Logo'
import Typography from '@material-ui/core/Typography'
import { bindActionCreators } from 'redux'
import drawerActions from '../../store/drawer/actions'
import { useDispatch } from 'react-redux'

const styles = _ => ({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh'
  },
  text: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const SignIn = ({ firebaseApp, appConfig, classes }) => {
  const uiConfig = {
    signInSuccessUrl: '/workspace',
    signInFlow: 'popup',
    callbacks: { signInSuccessWithAuthResult: () => false },
    signInOptions: appConfig.firebase_providers,
    credentialHelper: firebaseui.auth.CredentialHelper.NONE
  }

  const { setDrawerMobileOpen, setDrawerOpen, setDrawerUseMinified } = bindActionCreators({ ...drawerActions }, useDispatch())
  setDrawerOpen(false)
  setDrawerMobileOpen(false)
  setDrawerUseMinified(false)

  return (
    <div className={classes.wrap}>
      <div className={classes.text}>
        <Logo />
        <Typography variant='h6' color='textSecondary' noWrap>
              The Cloud Desktop
        </Typography>
        <AuthUI firebaseApp={firebaseApp} uiConfig={uiConfig} />
      </div>
    </div>
  )
}

SignIn.propTypes = {
  classes: PropTypes.object,
  firebaseApp: PropTypes.object,
  appConfig: PropTypes.object
}

export default withStyles(styles, { withTheme: true })(withFirebase(withAppConfigs(SignIn)))
