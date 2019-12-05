/* eslint-disable react/jsx-key */
import React, { lazy } from 'react'
import RestrictedRoute from '../containers/RestrictedRoute'

const Workspace = lazy(() => import('../pages/Workspace'))
const WebStore = lazy(() => import('../pages/WebStore'))

const routes = [
  <RestrictedRoute type='private' path='/' exact component={Workspace} />,
  <RestrictedRoute type='private' path='/workspace' exact component={Workspace} />,
  <RestrictedRoute type='private' path='/webstore' exact component={WebStore} />
]

export default routes
