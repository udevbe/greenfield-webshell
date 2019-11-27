/* eslint-disable react/jsx-key */
import React from 'react'
import RestrictedRoute from '../../containers/RestrictedRoute'
import makeLoadable from '../../containers/MyLoadable'
import { Route } from 'react-router-dom'

const getAppRoutes = firebaseLoader => {
  const MyLoadable = (opts, preloadComponents) => makeLoadable({ ...opts, firebase: firebaseLoader }, preloadComponents)

  // TODO groups
  const AsyncUser = MyLoadable({ loader: () => import('../../pages/Users/User') })
  const AsyncUsers = MyLoadable({ loader: () => import('../../pages/Users/Users') }, [AsyncUser])
  const AsyncMyAccount = MyLoadable({ loader: () => import('../../pages/MyAccount') })
  const AsyncRole = MyLoadable({ loader: () => import('../../pages/Roles/Role') })
  const AsyncRoles = MyLoadable({ loader: () => import('../../pages/Roles/Roles') }, [AsyncRole])

  const AsyncPageNotFound = MyLoadable({ loader: () => import('../../pages/PageNotFound') })

  return [
    <RestrictedRoute
      type='private'
      path='/users'
      exact
      component={AsyncUsers}
    />,
    <RestrictedRoute
      type='private'
      path='/users/:select'
      exact
      component={AsyncUsers}
    />,
    <RestrictedRoute
      type='private'
      path='/users/edit/:uid/:editType'
      exact
      component={AsyncUser}
    />,
    <RestrictedRoute
      type='private'
      path='/my_account'
      exact
      component={AsyncMyAccount}
    />,
    <RestrictedRoute
      type='private'
      path='/roles'
      exact
      component={AsyncRoles}
    />,
    <RestrictedRoute
      type='private'
      path='/roles/edit/:uid/:editType'
      exact
      component={AsyncRole}
    />,
    <Route component={AsyncPageNotFound} />
  ]
}

export default getAppRoutes
