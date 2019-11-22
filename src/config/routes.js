/* eslint-disable react/jsx-key */
import React from 'react'
import RestrictedRoute from '../containers/RestrictedRoute'
import makeLoadable from '../containers/MyLoadable'

const MyLoadable = (opts, preloadComponents) =>
  makeLoadable({ ...opts, firebase: () => import('./firebaseInit') }, preloadComponents)

const AsyncWorkspace = MyLoadable({ loader: () => import('../pages/Workspace') })
const AsyncWebstore = MyLoadable({ loader: () => import('../pages/Webstore') })

const routes = [
  <RestrictedRoute type='private' path='/' exact component={AsyncWorkspace} />,
  <RestrictedRoute type='private' path='/workspace' exact component={AsyncWorkspace} />,
  <RestrictedRoute type='private' path='/webstore' exact component={AsyncWebstore} />
]

export default routes
