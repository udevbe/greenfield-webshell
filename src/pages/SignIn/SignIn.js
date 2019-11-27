import AuthUI from '../../containers/AuthUI/AuthUI'
import React from 'react'
import { Typography } from '@material-ui/core'
import Logo from '../../components/Logo'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { isEmpty, isLoaded, useFirebase } from 'react-redux-firebase'
import { Redirect } from 'react-router'
import { saveAuthorisation } from '../../utils/auth'

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

function updateUserOnlineStatus (firebase, auth) {
  // TODO use firebase build in functionality for this
  const myConnectionsRef = firebase.ref(`users/${auth.uid}/connections`)
  const lastOnlineRef = firebase.ref(`users/${auth.uid}/lastOnline`)
  lastOnlineRef.onDisconnect().set(new Date())
  const con = myConnectionsRef.push(true)
  con.onDisconnect().remove()
}

function updateUserPublicData (firebase, auth) {
  const publicProviderData = []

  auth.providerData.forEach(provider => {
    publicProviderData.push({
      providerId: provider.providerId,
      displayName: provider.displayName ? provider.displayName : null
    })
  })

  const publicUserData = {
    displayName: auth.displayName ? auth.displayName : 'UserName',
    photoURL: auth.photoURL,
    uid: auth.uid,
    providerData: publicProviderData
  }

  firebase.ref(`users/${auth.uid}`).update(publicUserData)
}

const SignIn = () => {
  const firebase = useFirebase()
  const classes = useStyles()
  const { isAuthorized, auth } = useSelector(({ firebase: { auth } }) => ({
    isAuthorized: isLoaded(auth) && !isEmpty(auth),
    auth
  }))
  if (isAuthorized) {
    saveAuthorisation(true)
    updateUserOnlineStatus(firebase, auth)
    updateUserPublicData(firebase, auth)
    // TODO redirect to wherever we came from based on redirect state we received
    return <Redirect to='/' />
  } else {
    saveAuthorisation(false)
    return (
      <div className={classes.wrap}>
        <div className={classes.text}>
          <Logo />
          <Typography variant='h6' color='textSecondary' noWrap>
              The Cloud Desktop
          </Typography>
          <AuthUI />
        </div>
      </div>
    )
  }
}

SignIn.propTypes = {}

export default SignIn
