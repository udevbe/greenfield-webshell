import AuthUI from '../../containers/AuthUI/AuthUI'
import type { FunctionComponent } from 'react'
import React from 'react'
import { Typography } from '@material-ui/core'
import Logo from '../../components/Logo'
import { makeStyles } from '@material-ui/core/styles'
import { shallowEqual, useSelector } from 'react-redux'
import type { ExtendedFirebaseInstance } from 'react-redux-firebase'
import {
  FirebaseReducer,
  isEmpty,
  isLoaded,
  useFirebase,
} from 'react-redux-firebase'
import { Redirect } from 'react-router'
import LoadingComponent from '../../components/LoadingComponent'
import Fade from '@material-ui/core/Fade'

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  text: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

function updateUserOnlineStatus(
  firebase: ExtendedFirebaseInstance,
  auth: FirebaseReducer.AuthState
): void {
  // TODO use firebase build in functionality for this
  const myConnectionsRef = firebase.ref(`users/${auth.uid}/connections`)
  const lastOnlineRef = firebase.ref(`users/${auth.uid}/lastOnline`)
  lastOnlineRef.onDisconnect().set(new Date())
  const con = myConnectionsRef.push(true)
  con.onDisconnect().remove()
}

function updateUserPublicData(
  firebase: ExtendedFirebaseInstance,
  auth: FirebaseReducer.AuthState
): void {
  const publicProviderData: { providerId: string; displayName: string }[] =
    auth.providerData?.map((provider) => {
      return {
        providerId: provider.providerId,
        displayName: provider.displayName ?? '',
      }
    }) ?? []

  const publicUserData = {
    displayName: auth.displayName ?? 'UserName',
    photoURL: auth.photoURL,
    uid: auth.uid,
    providerData: publicProviderData,
  }

  firebase.ref(`users/${auth.uid}`).update(publicUserData)
}

const SignIn: FunctionComponent = () => {
  const firebase = useFirebase()
  const locationState: {
    fromRedirect: boolean
    fromLocation: string
  } = useSelector((state) => state.router.location.state)
  const auth = useSelector((state) => state.firebase.auth, shallowEqual)

  const classes = useStyles()
  if (!isLoaded(auth)) {
    return <LoadingComponent />
  } else if (isEmpty(auth)) {
    // TODO i18n
    return (
      <Fade in timeout={1000}>
        <div className={classes.wrap}>
          <div className={classes.text}>
            <Logo />
            <Typography variant="h6" color="textSecondary" noWrap>
              The Cloud Desktop.
            </Typography>
            <AuthUI />
          </div>
        </div>
      </Fade>
    )
  } else {
    updateUserOnlineStatus(firebase, auth)
    updateUserPublicData(firebase, auth)

    if (locationState && locationState.fromRedirect) {
      return <Redirect to={locationState.fromLocation} />
    } else {
      return <Redirect to="/" />
    }
  }
}

export default React.memo(SignIn)
