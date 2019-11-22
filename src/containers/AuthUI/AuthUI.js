import React from 'react'
import { isEmpty, isLoaded, useFirebase } from 'react-redux-firebase'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { useSelector } from 'react-redux'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import LoadingComponent from '../../components/LoadingComponent'

const AuthUI = () => {
  const appConfig = useAppConfig()
  const firebase = useFirebase()
  const auth = useSelector(store => store.firebase.auth)

  return (
    <div style={{ paddingTop: 35 }}>
      <StyledFirebaseAuth
        uiConfig={{
          signInFlow: 'popup',
          signInSuccessUrl: '/workspace',
          signInOptions: appConfig.firebase_providers,
          callbacks: {
            signInSuccessWithAuthResult: (authResult, redirectUrl) => {
              firebase.handleRedirectResult(authResult).then(() => {
                // history.push(redirectUrl); if you use react router to redirect
              })
              return false
            }
          }
        }}
        firebaseAuth={firebase.auth()}
      />
      <div>
        {
          !isLoaded(auth)
            ? <LoadingComponent />
            : isEmpty(auth)
            ? <span>Not Authed</span>
            : <pre>{JSON.stringify(auth, null, 2)}</pre>
        }
      </div>
    </div>
  )
}

export default AuthUI
