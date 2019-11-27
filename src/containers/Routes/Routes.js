import React from 'react'
import getAppRoutes from '../../components/AppRoutes'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { Switch } from 'react-router-dom'

export const Routes = () => {
  const appConfig = useAppConfig()
  const customRoutes = appConfig.routes ? appConfig.routes : []
  const appRoutes = getAppRoutes(appConfig.firebaseLoader)

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Switch>
        {customRoutes.map((Route, i) => React.cloneElement(Route, { key: `@customRoutes/${i}` }))}
        {appRoutes.map((Route, i) => React.cloneElement(Route, { key: `@appRoutes/${i}` }))}
      </Switch>
    </div>
  )
}

export default Routes
