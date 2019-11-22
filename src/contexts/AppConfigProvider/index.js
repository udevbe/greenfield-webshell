import AppConfigContext from './Context'
import { useContext } from 'react'

export const useAppConfig = () => useContext(AppConfigContext)
export { default as withAppConfigs } from './withAppConfigs.js'
export { default } from './Provider.js'
