import PropTypes from 'prop-types'
import React from 'react'
import Context from './Context'
import { useDispatch, useSelector } from 'react-redux'
import {
  compositorInitialized,
  compositorInitializing,
  createClient,
  createUserSurface,
  destroyClient,
  destroyUserSurface,
  updateUserSeat,
  updateUserSurface
} from '../../store/compositor'
import { showNotification } from '../../store/notification'

const importCompositorModule = import('compositor-module')
const compositorSession = { globals: null, webAppLauncher: null, remoteAppLauncher: null, actions: null }

window.GREENFIELD_DEBUG = process.env.NODE_ENV === 'development'

const CompositorProvider = React.memo(({ children }) => {
  const dispatch = useDispatch()

  const isInitialized = useSelector(({ compositor }) => compositor.initialized)
  const isInitializing = useSelector(({ compositor }) => compositor.initializing)
  const userConfiguration = useSelector(({ compositor }) => compositor.userConfiguration)
  if (isInitialized && userConfiguration) {
    compositorSession.actions.setUserConfiguration(userConfiguration)
  }

  if (!isInitialized && !isInitializing) {
    dispatch(compositorInitializing())
    importCompositorModule.then(({
      initWasm,
      RemoteAppLauncher,
      RemoteSocket,
      Session,
      WebAppLauncher,
      WebAppSocket
    }) => {
      initWasm().then(() => {
        const session = Session.create()
        const userShell = session.userShell

        userShell.events.notify = (variant, message) => dispatch(showNotification({ variant, message }))

        userShell.events.createApplicationClient = client => dispatch(createClient({ ...client }))
        userShell.events.destroyApplicationClient = client => dispatch(destroyClient({ ...client }))

        userShell.events.createUserSurface = (userSurface, userSurfaceState) => {
          dispatch(createUserSurface({
            ...userSurface,
            ...userSurfaceState
          }))
        }
        userShell.events.updateUserSurface = (userSurface, userSurfaceState) => {
          dispatch(updateUserSurface({ ...userSurface, ...userSurfaceState }))
        }
        userShell.events.destroyUserSurface = userSurface => { dispatch(destroyUserSurface({ ...userSurface })) }
        userShell.events.updateUserSeat = userSeatState => { dispatch(updateUserSeat({ ...userSeatState })) }

        const webAppSocket = WebAppSocket.create(session)
        const webAppLauncher = WebAppLauncher.create(webAppSocket)

        const remoteSocket = RemoteSocket.create(session)
        const remoteAppLauncher = RemoteAppLauncher.create(session, remoteSocket)

        compositorSession.webAppLauncher = webAppLauncher
        compositorSession.remoteAppLauncher = remoteAppLauncher
        compositorSession.actions = userShell.actions

        dispatch(compositorInitialized())
        session.globals.register()
      })
    })
  }

  return <Context.Provider value={compositorSession}>{children}</Context.Provider>
})

CompositorProvider.propTypes = {
  children: PropTypes.any
}

export default CompositorProvider
