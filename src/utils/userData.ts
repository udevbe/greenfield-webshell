import { useSelector } from 'react-redux'
import { FirebaseReducer, useFirebaseConnect } from 'react-redux-firebase'

export function useUserProp<T extends keyof FirebaseReducer.AuthState>(
  uid: string,
  propName: T,
  equalityFn?: (left: FirebaseReducer.AuthState[T], right: FirebaseReducer.AuthState[T]) => boolean
): FirebaseReducer.AuthState[T] | undefined {
  useFirebaseConnect(`/users/${uid}/${propName}`)
  return useSelector((state) => state.firebase.data.users?.[uid]?.[propName], equalityFn)
}

export function useUserPropLoading(uid: string, propName: keyof FirebaseReducer.AuthState): boolean {
  return useSelector((state) => state.firebase.requesting[`users/${uid}/${propName}`])
}
