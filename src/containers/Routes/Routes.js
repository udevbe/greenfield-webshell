import React, { Suspense } from 'react'
import getAppRoutes from '../../components/AppRoutes'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { Switch } from 'react-router-dom'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'

export const Routes = () => {
  const appConfig = useAppConfig()
  const customRoutes = appConfig.routes ? appConfig.routes : []
  const appRoutes = getAppRoutes()

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={<LoadingComponent />}>
        <Switch>
          {customRoutes.map((Route, i) => React.cloneElement(Route, { key: `@customRoutes/${i}` }))}
          {appRoutes.map((Route, i) => React.cloneElement(Route, { key: `@appRoutes/${i}` }))}
        </Switch>
      </Suspense>
    </div>
  )
}

export default Routes
