/* eslint-disable react/jsx-key */
import React, { lazy } from 'react'
import RestrictedRoute from '../../containers/RestrictedRoute'
import { Route } from 'react-router-dom'

const getAppRoutes = () => {
  const User = lazy(() => import('../../pages/Users/User'))
  const Users = lazy(() => import('../../pages/Users/Users'))
  const MyAccount = lazy(() => import('../../pages/MyAccount'))
  const Role = lazy(() => import('../../pages/Roles/Role'))
  const Roles = lazy(() => import('../../pages/Roles/Roles'))

  const AsyncPageNotFound = lazy(() => import('../../pages/PageNotFound'))

  return [
    <RestrictedRoute
      type='private'
      path='/users'
      exact
      component={Users}
    />,
    <RestrictedRoute
      type='private'
      path='/users/:select'
      exact
      component={Users}
    />,
    <RestrictedRoute
      type='private'
      path='/users/edit/:uid/:editType'
      exact
      component={User}
    />,
    <RestrictedRoute
      type='private'
      path='/my_account'
      exact
      component={MyAccount}
    />,
    <RestrictedRoute
      type='private'
      path='/roles'
      exact
      component={Roles}
    />,
    <RestrictedRoute
      type='private'
      path='/roles/edit/:uid/:editType'
      exact
      component={Role}
    />,
    <Route component={AsyncPageNotFound} />
  ]
}

export default getAppRoutes
