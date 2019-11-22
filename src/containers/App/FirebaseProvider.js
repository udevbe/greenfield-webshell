import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import React from 'react'
import { useDispatch } from 'react-redux'

export const FirebaseProvider = ({ firebase, children }) => {
  const dispatch = useDispatch()
  return (
    <ReactReduxFirebaseProvider
      firebase={firebase}
      config={{ userProfile: 'users' }}
      dispatch={dispatch}
    >
      {children}
    </ReactReduxFirebaseProvider>
  )
}
