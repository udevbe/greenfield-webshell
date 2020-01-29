import React, { Suspense } from 'react'
import getAppRoutes from '../../components/AppRoutes'
import { Switch } from 'react-router-dom'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'

export const Routes = React.memo(() => {
  const appRoutes = getAppRoutes()

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={<LoadingComponent />}>
        <Switch>
          {appRoutes.map((Route, i) => React.cloneElement(Route, { key: `@appRoutes/${i}` }))}
        </Switch>
      </Suspense>
    </div>
  )
})

export default Routes
