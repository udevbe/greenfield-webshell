import { useSelector } from 'react-redux'
import { ExtendedFirebaseInstance, useFirebaseConnect } from 'react-redux-firebase'
import { UserAppByUserIdSchema } from '../@types/FirebaseDataBaseSchema'

export function useUserAppIds(firebase: ExtendedFirebaseInstance, uid: string): string[] {
  useFirebaseConnect([{ path: `/apps_by_user_id/${uid}` }])
  return useSelector(({ firebase }) => {
    const userAppLinks: UserAppByUserIdSchema = firebase.data.apps_by_user_id?.[uid] ?? {}
    return Object.values(userAppLinks).map((value) => value.appId)
  })
}

export function useUserAppsLoading(uid: string) {
  return useSelector((state) => state.firebase.requesting[`apps_by_user_id/${uid}`])
}

export function useUserAppLinkId(firebase: ExtendedFirebaseInstance, uid: string, appId: string): string | undefined {
  useFirebaseConnect([{ path: `/apps_by_user_id/${uid}` }])
  return useSelector(({ firebase }) => {
    const userAppLinks: UserAppByUserIdSchema = firebase.data.apps_by_user_id?.[uid] ?? {}
    return Object.entries(userAppLinks).find(([key, value]) => value.appId === appId)?.[0]
  })
}

export function useUserAppLinkIdLoading(uid: string) {
  return useSelector((state) => state.firebase.requesting[`apps_by_user_id/${uid}`])
}
