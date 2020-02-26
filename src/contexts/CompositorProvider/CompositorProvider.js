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
import { createLocalWorkspace } from '../../store/workspace'

const importCompositorModule = import('compositor-module')
const compositorSession = { globals: null, webAppLauncher: null, remoteAppLauncher: null, actions: null }

window.GREENFIELD_DEBUG = process.env.NODE_ENV === 'development'

/**
 * @returns {string}
 * @private
 */
function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

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
        compositorSession.actions = {
          ...userShell.actions,
          createScene: name => {
            const id = uuidv4()
            const canvas = document.createElement('canvas')
            canvas.style.display = 'none'
            canvas.id = id
            document.body.appendChild(canvas)
            compositorSession.actions.initScene(id, canvas)
            dispatch(createLocalWorkspace({ name, id }))
          }
        }

        compositorSession.actions.createScene('default')

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
