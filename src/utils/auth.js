import { useFirebaseConnect } from 'react-redux-firebase'
import { useSelector, useStore } from 'react-redux'

function isGranted (userGrants, grant) {
  if (userGrants !== undefined) {
    for (const userGrant of userGrants) {
      if (userGrant.key === grant) {
        return userGrant.val === true
      }
    }
  }

  return false
}

export function useIsGranted (...requestedGrants) {
  // TODO useStore() instead?
  const auth = useSelector(({ firebase: { auth } }) => auth)
  useFirebaseConnect([{ path: `/user_grants/${auth.uid}`, storeAs: 'user_grants' }])
  const userGrants = useSelector(state => state.firebase.ordered.user_grants)
  return requestedGrants.map(requestedGrant => ({ requestedGrant: isGranted(userGrants, requestedGrant) }))
}

const localStorageAuthKey = 'greenfield:isAuthorised'

export function saveAuthorisation (hasAuth) {
  if (typeof Storage !== 'undefined') {
    try {
      window.localStorage.setItem(localStorageAuthKey, hasAuth)
    } catch (ex) {
      console.log(ex)
    }
  } else {
    // No web storage Support.
  }
}

export function isAuthorised () {
  if (typeof Storage !== 'undefined') {
    try {
      return window.localStorage.getItem(localStorageAuthKey) === 'true'
    } catch (ex) {
      return false
    }
  } else {
    // No web storage Support.
  }
}
