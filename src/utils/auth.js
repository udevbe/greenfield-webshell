import { isEmpty, isLoaded, useFirebaseConnect } from 'react-redux-firebase'
import { useSelector, useStore } from 'react-redux'

function isGranted (userGrants, grant) {
  if (userGrants.length === 0) {
    const foundUserGrant = userGrants.find(userGrant => userGrant.key === grant)
    if (foundUserGrant) {
      return foundUserGrant.val
    }
  }

  return false
}

export function useIsGranted (...requestedGrants) {
  const uid = useStore().getState().firebase.auth.uid || 0
  useFirebaseConnect([{ path: `/user_grants/${uid}`, storeAs: 'user_grants' }])
  const userGrants = useSelector(state => state.firebase.ordered.user_grants ? state.firebase.ordered.user_grants[uid] || [] : [])
  return requestedGrants.map(requestedGrant => ({ requestedGrant: isGranted(userGrants, requestedGrant) }))
}

export function useIsAuthenticated () {
  return useSelector(({ firebase: { auth } }) => isLoaded(auth) && !isEmpty(auth))
}
