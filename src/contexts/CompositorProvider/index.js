import CompositorContext from './Context'
import { useContext } from 'react'

/**
 * @return {{globals: Globals, webAppLauncher: WebAppLauncher, remoteAppLauncher: RemoteAppLauncher, userShellHooks: UserShellHooks}}
 */
export const useCompositor = () => useContext(CompositorContext)
export { default } from './CompositorProvider.js'
