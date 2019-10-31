import * as firebaseui from 'firebaseui'
import Activity from '../../containers/Activity'
import AuthUI from '../../containers/AuthUI/AuthUI'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { withAppConfigs } from '../../contexts/AppConfigProvider'
import { withFirebase } from 'firekit-provider'
import { withStyles } from '@material-ui/core'
import Logo from '../../components/Logo'

const styles = theme => ({
  wrap: {
    display: 'flex',
    height: '100%'
  },
  text: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export class SignIn extends Component {
  render () {
    const { intl, firebaseApp, appConfig, classes } = this.props

    const uiConfig = {
      signInSuccessUrl: '/',
      signInFlow: 'popup',
      callbacks: { signInSuccessWithAuthResult: () => false },
      signInOptions: appConfig.firebase_providers,
      credentialHelper: firebaseui.auth.CredentialHelper.NONE
    }

    return (
      <Activity title={intl.formatMessage({ id: 'sign_in' })}>
        <div className={classes.wrap}>
            <div className={classes.text}>
              <Logo />
               <AuthUI firebaseApp={firebaseApp} uiConfig={uiConfig} />
            </div>
        </div>
      </Activity>
    )
  }
}

SignIn.propTypes = {
  intl: PropTypes.object.isRequired
}

export default injectIntl(withStyles(styles, { withTheme: true })(withFirebase(withAppConfigs(SignIn))))
