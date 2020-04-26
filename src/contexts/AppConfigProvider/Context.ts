import React from 'react'
import { AppConfig } from '../../config/config'

const AppConfigContext: React.Context<AppConfig | null> = React.createContext<AppConfig | null>(
  null
)
AppConfigContext.displayName = 'AppConfig'
export default AppConfigContext
