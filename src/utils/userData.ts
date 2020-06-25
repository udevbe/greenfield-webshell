import { useSelector } from 'react-redux'
import { useFirebaseConnect } from 'react-redux-firebase'

export function useUserProp(
  uid: string,
  propName: 'displayName' | 'photoURL' | 'providerData',
  equalityFn: (left: string, right: string) => boolean
): string {
  useFirebaseConnect([{ path: `/users/${uid}/${propName}` }])
  return useSelector(({ firebase }) => {
    if (firebase.data.users && firebase.data.users[uid]) {
      return firebase.data.users[uid][propName]
    } else {
      return ''
    }
  }, equalityFn)
}

export function useUserPropLoading(uid: string, propName: 'displayName' | 'photoURL' | 'providerData'): boolean {
  return useSelector((state) => state.firebase.requesting[`users/${uid}/${propName}`])
}
