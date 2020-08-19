import React from 'react'
import { AppConfig } from '../../config/config'

// @ts-ignore
const AppConfigContext: React.Context<AppConfig> = React.createContext<AppConfig>(null)
AppConfigContext.displayName = 'AppConfig'
export default AppConfigContext
