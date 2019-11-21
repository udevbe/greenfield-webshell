import * as firebaseui from 'firebaseui'
import AuthUI from '../../containers/AuthUI/AuthUI'
import React from 'react'
import { withAppConfigs } from '../../contexts/AppConfigProvider'
import { Typography } from '@material-ui/core'
import { bindActionCreators, compose } from 'redux'
import Logo from '../../components/Logo'
import drawerActions from '../../store/drawer/actions'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { useFirebase } from 'react-redux-firebase'

const useStyles = makeStyles({
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

const SignIn = ({ appConfig }) => {
  const firebaseApp = useFirebase().app

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

  const classes = useStyles()

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

SignIn.propTypes = {}

export default compose(
  withAppConfigs
)(SignIn)
