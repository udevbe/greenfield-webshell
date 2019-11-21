import React, { useEffect } from 'react'
import * as firebaseui from 'firebaseui'
import { useFirebase } from 'react-redux-firebase'
import { withAppConfigs } from '../../contexts/AppConfigProvider'
import { compose } from 'redux'

let authUi = null

const AuthUI = ({ uiConfig }) => {
  const firebaseApp = useFirebase().app
  useEffect(() => {
    if (!firebaseui.auth.AuthUI.getInstance()) {
      authUi = new firebaseui.auth.AuthUI(firebaseApp.auth())
    }
    authUi.start('#firebaseui-auth', uiConfig)
    return () => authUi.reset()
  })

  return (
    <div style={{ paddingTop: 35 }}>
      <div id='firebaseui-auth' />
    </div>
  )
}

export default compose(
  withAppConfigs
)(AuthUI)
