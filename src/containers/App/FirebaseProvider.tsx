import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import React, { FunctionComponent } from 'react'
import { useDispatch } from 'react-redux'
import firebase from '../../config/firebaseInit'

const FirebaseProvider: FunctionComponent = ({ children }) => {
  const dispatch = useDispatch()
  return (
    <ReactReduxFirebaseProvider firebase={firebase} config={{ userProfile: 'users' }} dispatch={dispatch}>
      {children}
    </ReactReduxFirebaseProvider>
  )
}

export default FirebaseProvider
