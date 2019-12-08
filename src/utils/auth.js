import { isEmpty, isLoaded, useFirebaseConnect } from 'react-redux-firebase'
import { shallowEqual, useSelector } from 'react-redux'

/**
 * @param {string} uid
 */
export function useIsAdmin (uid) {
  useFirebaseConnect([{ path: `admins/${uid}` }])
  return useSelector(state => state.firebase.data.admins ? state.firebase.data.admins[uid] || false : false)
}

export function useIsAdminLoading (uid) {
  return useSelector(state => state.firebase.requesting[`admins/${uid}`])
}

export function useUserId () {
  return useSelector(({ firebase }) => firebase.auth.uid || 0)
}

/**
 * @param {string}uid
 * @return {Array<Object.<string, boolean>>}
 */
export function useUserRoles (uid) {
  useFirebaseConnect([{ path: `user_roles/${uid}` }])
  return useSelector(state => state.firebase.ordered.user_roles ? state.firebase.ordered.user_roles[uid] || [] : [], shallowEqual)
}

export function useUserRolesLoading (uid) {
  return useSelector(state => state.firebase.requesting[`user_roles/${uid}`])
}

export function useUserRoleEnabled (uid, roleId) {
  useFirebaseConnect([{ path: `user_roles/${uid}/${roleId}` }])
  return useSelector(state => {
    if (state.firebase.data.user_roles && state.firebase.data.user_roles[uid]) {
      return state.firebase.data.user_roles[uid][roleId]
    } else {
      return false
    }
  })
}

export function useUserRoleEnabledLoading (uid, roleId) {
  return useSelector(state => state.firebase.requesting[`user_roles/${uid}/${roleId}`])
}

export function useRoles () {
  useFirebaseConnect([{ path: '/roles' }])
  return useSelector(state => state.firebase.ordered.roles || [])
}

export function useRolesLoading () {
  return useSelector(state => state.firebase.requesting['/roles'])
}

export function useGrant (uid, grant) {
  useFirebaseConnect([{ path: '/role_grants' }])
  useFirebaseConnect([{ path: `/user_roles/${uid}` }])

  return useSelector(({ firebase }) => {
    if (firebase.data.user_roles && firebase.data.user_roles[uid]) {
      const userRoles = firebase.data.user_roles[uid]
      const enabledUserRoles = Object.entries(userRoles).filter(([_, enabled]) => enabled)

      return enabledUserRoles.filter(([roleId, _]) => {
        if (firebase.data.role_grants && firebase.data.role_grants[roleId]) {
          return !!firebase.data.role_grants[roleId][grant]
        } else {
          return false
        }
      }).length !== 0
    }
    return false
  })
}

export function useIsAuthenticated () {
  return useSelector(({ firebase: { auth } }) => isLoaded(auth) && !isEmpty(auth))
}
