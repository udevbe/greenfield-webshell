import { useFirebaseConnect } from 'react-redux-firebase'
import { useSelector } from 'react-redux'

export function useUserAppIds(firebase, uid) {
  useFirebaseConnect([{ path: `/apps_by_user_id/${uid}` }])
  return useSelector(({ firebase }) => {
    if (firebase.ordered.user_apps && firebase.ordered.apps_by_user_id && firebase.ordered.apps_by_user_id[uid]) {
      const userAppLinks = firebase.ordered.apps_by_user_id[uid] || []
      return userAppLinks.map(({ value }) => value.appId)
    } else {
      return []
    }
  })
}

export function useUserAppsLoading(uid) {
  return useSelector((state) => state.firebase.requesting[`apps_by_user_id/${uid}`])
}

export function usePublicApps(uid) {}

export function useUserAppLinkId(firebase, uid, appId) {
  useFirebaseConnect([{ path: `/apps_by_user_id/${uid}` }])
  return useSelector(({ firebase }) => {
    if (firebase.ordered.user_apps && firebase.ordered.apps_by_user_id && firebase.ordered.apps_by_user_id[uid]) {
      const appLink = firebase.ordered.apps_by_user_id[uid].find(({ value }) => {
        return value.appId === appId
      })
      return appLink ? appLink.key : null
    } else {
      return null
    }
  })
}

export function useUserAppLinkIdLoading(uid) {
  return useSelector((state) => state.firebase.requesting[`apps_by_user_id/${uid}`])
}
