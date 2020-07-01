import { useSelector } from 'react-redux'
import { FirebaseReducer, useFirebaseConnect } from 'react-redux-firebase'
import AuthState = FirebaseReducer.AuthState

export function useUserProp<T extends keyof AuthState>(
  uid: string,
  propName: T,
  equalityFn?: (left: AuthState[T], right: AuthState[T]) => boolean
): AuthState[T] | undefined {
  useFirebaseConnect(`/users/${uid}/${propName}`)
  return useSelector((state) => state.firebase.data.users?.[uid]?.[propName], equalityFn)
}

export function useUserPropLoading(uid: string, propName: keyof AuthState): boolean {
  return useSelector((state) => state.firebase.requesting[`users/${uid}/${propName}`])
}
