import React, { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'
import RestrictedRoute from '../RestrictedRoute'
import WorkspaceScene from '../../pages/Workspace/WorkspaceScene'

const User = lazy(() => import('../../pages/Users/User'))
const Users = lazy(() => import('../../pages/Users/Users'))
const MyAccount = lazy(() => import('../../pages/MyAccount'))
const Role = lazy(() => import('../../pages/Roles/Role'))
const Roles = lazy(() => import('../../pages/Roles/Roles'))

const Workspace = lazy(() => import('../../pages/Workspace'))
const WebStore = lazy(() => import('../../pages/WebStore/WebStore'))
const AboutApp = lazy(() => import('../../pages/WebStore/AppDetails'))

const Settings = lazy(() => import('../../pages/Settings'))
const SiteSettings = lazy(() => import('../../pages/Settings/SiteSettings'))
const InputSettings = lazy(() => import('../../pages/Settings/InputSettings'))

const AsyncPageNotFound = lazy(() => import('../../pages/PageNotFound'))

export const Routes = React.memo(() => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={<LoadingComponent />}>
        <Switch>
          <RestrictedRoute type='private' path='/users' exact>
            <Users />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/users/:select' exact>
            <Users />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/users/edit/:uid/:editType' exact>
            <User />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/my_account' exact>
            <MyAccount />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/roles' exact>
            <Roles />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/roles/edit/:uid/:editType' exact>
            <Role />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/' exact>
            <Workspace />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/workspace' exact>
            <Workspace />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/workspace/:sceneId' exact>
            <WorkspaceScene />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/webstore' exact>
            <WebStore />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/webstore/:appid' exact>
            <AboutApp />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/settings' exact>
            <Settings />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/settings/site' exact>
            <SiteSettings />
          </RestrictedRoute>,
          <RestrictedRoute type='private' path='/settings/input' exact>
            <InputSettings />
          </RestrictedRoute>,
          <Route>
            <AsyncPageNotFound />
          </Route>
        </Switch>
      </Suspense>
    </div>
  )
})

export default Routes
