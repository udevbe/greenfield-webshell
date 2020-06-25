import { shallowEqual, useSelector } from 'react-redux'
import { isEmpty, isLoaded, useFirebaseConnect } from 'react-redux-firebase'

export function useIsAdmin(uid: string) {
  useFirebaseConnect([{ path: `/admins/${uid}` }])
  return useSelector((state) => (state.firebase.data.admins ? state.firebase.data.admins[uid] || false : false))
}

export function useIsAdminLoading(uid: string) {
  return useSelector((state) => state.firebase.requesting[`admins/${uid}`])
}

export function useUserId() {
  return useSelector(({ firebase }) => firebase.auth.uid || 0)
}

export function useUserRoles(uid: string): { [key: string]: boolean }[] {
  useFirebaseConnect([{ path: `/user_roles/${uid}` }])
  return useSelector(
    (state) => (state.firebase.ordered.user_roles ? state.firebase.ordered.user_roles[uid] || [] : []),
    shallowEqual
  )
}

export function useUserRolesLoading(uid: string) {
  return useSelector((state) => state.firebase.requesting[`user_roles/${uid}`])
}

export function useUserRoleEnabled(uid: string, roleId: string): boolean {
  useFirebaseConnect([{ path: `/user_roles/${uid}/${roleId}` }])
  return useSelector((state) => {
    if (state.firebase.data.user_roles && state.firebase.data.user_roles[uid]) {
      return state.firebase.data.user_roles[uid][roleId]
    } else {
      return false
    }
  })
}

export function useUserRoleEnabledLoading(uid: string, roleId: string) {
  return useSelector((state) => state.firebase.requesting[`user_roles/${uid}/${roleId}`])
}

export function useRoles() {
  useFirebaseConnect([{ path: '/roles' }])
  return useSelector((state) => state.firebase.ordered.roles || [])
}

export function useRolesLoading(): boolean {
  return useSelector((state) => state.firebase.requesting.roles)
}

export function useUserIsAnonymous(): boolean {
  return useSelector(({ firebase }) => firebase.auth.isAnonymous)
}

export function useGrant(uid: string, grant: string): boolean {
  useFirebaseConnect([{ path: '/role_grants' }])
  useFirebaseConnect([{ path: `/user_roles/${uid}` }])

  return useSelector(({ firebase }) => {
    if (firebase.data.user_roles && firebase.data.user_roles[uid]) {
      const userRoles = firebase.data.user_roles[uid]
      const enabledUserRoles = Object.entries(userRoles).filter(([_, enabled]) => enabled)

      return (
        enabledUserRoles.filter(([roleId, _]) => {
          if (firebase.data.role_grants && firebase.data.role_grants[roleId]) {
            return !!firebase.data.role_grants[roleId][grant]
          } else {
            return false
          }
        }).length !== 0
      )
    }
    return false
  })
}

export function useIsAuthenticated(): boolean {
  return useSelector(({ firebase: { auth } }) => isLoaded(auth) && !isEmpty(auth))
}
