export default function isGranted (state, grant) {
  const { auth, lists, paths } = state

  const userGrants = lists[`user_grants/${auth.uid}`]
  const isAdmin = paths[`admins/${auth.uid}`]

  if (auth.isAuthorised !== true) {
    return false
  }

  if (isAdmin === true) {
    return true
  }

  if (userGrants !== undefined) {
    for (const userGrant of userGrants) {
      if (userGrant.key === grant) {
        return userGrant.val === true
      }
    }
  }

  return false
}

export function isAnyGranted (state, grants) {
  if (grants !== undefined) {
    for (const grant of grants) {
      if (isGranted(state, grant) === true) {
        return true
      }
    }
  }

  return false
}

const localStorageAuthKey = 'greenfield:isAuthorised'

export function saveAuthorisation (user) {
  if (typeof Storage !== 'undefined') {
    try {
      window.localStorage.setItem(localStorageAuthKey, Boolean(user))
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
