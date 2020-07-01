import React, { FunctionComponent } from 'react'
import { useFirebase } from 'react-redux-firebase'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import FirebaseAuth from 'react-firebaseui/FirebaseAuth'

const AuthUI: FunctionComponent = () => {
  const firebase = useFirebase()
  const appConfig = useAppConfig()

  return (
    <div style={{ paddingTop: 35 }}>
      <FirebaseAuth
        uiConfig={{
          signInFlow: 'popup',
          signInSuccessUrl: '/workspace',
          signInOptions: appConfig.firebase_providers,
          callbacks: {
            signInSuccessWithAuthResult: (authResult, redirectUrl) => false,
          },
        }}
        firebaseAuth={firebase.auth()}
      />
    </div>
  )
}

export default React.memo(AuthUI)
