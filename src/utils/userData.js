import { useFirebaseConnect } from 'react-redux-firebase'
import { useSelector } from 'react-redux'

/**
 * @param {string}uid
 * @param {'displayName'|'photoURL'|'providerData'}propName
 * @param {function():void}[equalityFn]
 * @return {string}
 */
export function useUserProp (uid, propName, equalityFn) {
  useFirebaseConnect([{ path: `/users/${uid}/${propName}` }])
  return useSelector(({ firebase }) => {
    if (firebase.data.users && firebase.data.users[uid]) {
      return firebase.data.users[uid][propName]
    } else {
      return ''
    }
  }, equalityFn)
}

/**
 * @param {string}uid
 * @param {'displayName'|'photoURL'|'providerData'}propName
 * @return {boolean}
 */
export function useUserPropLoading (uid, propName) {
  return useSelector(state => state.firebase.requesting[`users/${uid}/${propName}`])
}
