/* eslint-disable react/jsx-key */
import React, { lazy } from 'react'
import RestrictedRoute from '../containers/RestrictedRoute'

const Workspace = lazy(() => import('../pages/Workspace'))
const WebStore = lazy(() => import('../pages/WebStore'))
const Settings = lazy(() => import('../pages/Settings'))
const SiteSettings = lazy(() => import('../pages/Settings/SiteSettings'))
const InputSettings = lazy(() => import('../pages/Settings/InputSettings'))

const routes = [
  <RestrictedRoute type='private' path='/' exact component={Workspace} />,
  <RestrictedRoute type='private' path='/workspace' exact component={Workspace} />,
  <RestrictedRoute type='private' path='/webstore' exact component={WebStore} />,
  <RestrictedRoute type='private' path='/settings' exact component={Settings} />,
  <RestrictedRoute type='private' path='/settings/site' exact component={SiteSettings} />,
  <RestrictedRoute type='private' path='/settings/input' exact component={InputSettings} />
]

export default routes
