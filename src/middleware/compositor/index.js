import { showNotification } from '../../store/notification'
import {
  createClient,
  createScene,
  createUserSurface,
  createUserSurfaceView,
  destroyClient,
  destroyScene,
  destroyUserSurface,
  destroyUserSurfaceView,
  initializeCompositor,
  inputAxis,
  inputButtonDown,
  inputButtonUp,
  inputKey,
  inputPointerMove,
  launchApp,
  makeSceneActive,
  notifyUserSurfaceInactive,
  raiseUserSurfaceView,
  refreshScene,
  requestUserSurfaceActive,
  terminateClient,
  updateUserConfiguration,
  updateUserSeat,
  updateUserSurface,
  userSurfaceKeyboardFocus
} from '../../store/compositor'
import CompositorModule from './CompositorModule'

class CompositorMiddleWareReducers {
  /**
   * @return {CompositorMiddleWareReducers}
   */
  static create () {
    const compositorModule = CompositorModule.create()
    return new CompositorMiddleWareReducers(compositorModule)
  }

  /**
   * @returns {string}
   * @private
   */
  static _uuidv4 () {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  }

  /**
   * @param {UserSurface}userSurface
   * @return {string}
   * @private
   */
  static _userSurfaceKey (userSurface) {
    return `${userSurface.id}@${userSurface.clientId}`
  }

  /**
   * @param {UserSurface}userSurface
   * @return {UserSurface}
   */
  static _updateLastActiveTimeStamp (userSurface) {
    // add last active timestamp
    if (userSurface && userSurface.active) {
      userSurface.lastActive = Date.now()
    }
    return userSurface
  }

  /**
   * @param {Promise<{remoteAppLauncher: RemoteAppLauncher, webAppLauncher: WebAppLauncher, session: Session}>}compositorModule
   */
  constructor (compositorModule) {
    /**
     * @type {Promise<{remoteAppLauncher: RemoteAppLauncher, webAppLauncher: WebAppLauncher, session: Session}>}
     * @private
     */
    this._compositorModule = compositorModule
    /**
     * @type {RemoteAppLauncher}
     * @private
     */
    this._remoteAppLauncher = null
    /**
     * @type {WebAppLauncher}
     * @private
     */
    this._webAppLauncher = null
    /**
     * @type {Session}
     * @private
     */
    this._session = null
  }

  _linkUserShellEvents (store) {
    const userShell = this._session.userShell
    userShell.events.notify = (variant, message) => store.dispatch(showNotification({ variant, message }))

    userShell.events.createApplicationClient = client => store.dispatch(createClient({ ...client }))
    userShell.events.destroyApplicationClient = client => store.dispatch(destroyClient({ ...client }))

    userShell.events.createUserSurface = (userSurface, userSurfaceState) => {
      store.dispatch(createUserSurface({
        ...userSurface,
        ...userSurfaceState,
        key: CompositorMiddleWareReducers._userSurfaceKey(userSurface)
      }))
    }
    userShell.events.updateUserSurface = (userSurface, userSurfaceState) => {
      store.dispatch(updateUserSurface({
        ...userSurface,
        ...userSurfaceState,
        key: CompositorMiddleWareReducers._userSurfaceKey(userSurface)
      }))
    }
    userShell.events.destroyUserSurface = userSurface => {
      store.dispatch(destroyUserSurface(CompositorMiddleWareReducers._userSurfaceKey(userSurface)))
    }
    userShell.events.updateUserSeat = userSeatState => {
      const { keyboardFocus, pointerGrab } = userSeatState
      const userSeat = store.getState().compositor.seat
      store.dispatch(updateUserSeat({
        ...userSeat,
        keyboardFocus: CompositorMiddleWareReducers._userSurfaceKey(keyboardFocus),
        pointerGrab: CompositorMiddleWareReducers._userSurfaceKey(pointerGrab)
      }))
    }
  }

  _restoreUserConfiguration (store) {
    const compositorState = store.getState().compositor
    const userConfiguration = compositorState.userConfiguration
    this._session.userShell.actions.setUserConfiguration(userConfiguration)
  }

  _initializeUserSeat (store) {
    const userSeat = store.getState().compositor.seat
    store.dispatch(updateUserSeat({
      ...userSeat,
      keyboard: {
        nrmlvoEntries: [...this._session.globals.seat.keyboard.nrmlvoEntries],
        defaultNrmlvo: this._session.globals.seat.keyboard.defaultNrmlvo
      }
    }))
  }

  _createDefaultWorkspace (store) {
    store.dispatch(createScene({ name: 'default', type: 'local' }))
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:undefined}}action
   * @return {*}
   */
  [initializeCompositor] (store, next, action) {
    const compositorState = store.getState().compositor
    if (!compositorState.initialized) {
      this._compositorModule.then(({ remoteAppLauncher, webAppLauncher, session }) => {
        this._remoteAppLauncher = remoteAppLauncher
        this._webAppLauncher = webAppLauncher
        this._session = session

        this._linkUserShellEvents(store)
        this._initializeUserSeat(store)
        this._createDefaultWorkspace(store)
        this._restoreUserConfiguration(store)

        this._session.globals.register()
        next(action)
      })
    }
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:UserSurfaceView}}action
   * @return {*}
   */
  [raiseUserSurfaceView] (store, next, action) {
    const { userSurfaceKey, sceneId } = action.payload
    const userSurface = store.getState().compositor.userSurfaces[userSurfaceKey]
    this._session.userShell.actions.raise(userSurface, sceneId)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:string}}action
   * @return {*}
   */
  [requestUserSurfaceActive] (store, next, action) {
    const userSurfaceKey = action.payload
    const userSurface = store.getState().compositor.userSurfaces[userSurfaceKey]
    this._session.userShell.actions.requestActive(userSurface)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{event: MouseEvent, sceneId: string}}}action
   * @return {*}
   */
  [inputPointerMove] (store, next, action) {
    const { event, sceneId } = action.payload
    this._session.userShell.actions.input.pointerMove(event, sceneId)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{event: MouseEvent, sceneId: string}}}action
   * @return {*}
   */
  [inputButtonDown] (store, next, action) {
    const { event, sceneId } = action.payload
    this._session.userShell.actions.input.buttonDown(event, sceneId)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{event: MouseEvent, sceneId: string}}}action
   * @return {*}
   */
  [inputButtonUp] (store, next, action) {
    const { event, sceneId } = action.payload
    this._session.userShell.actions.input.buttonUp(event, sceneId)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{event: WheelEvent, sceneId: string}}}action
   * @return {*}
   */
  [inputAxis] (store, next, action) {
    const { event, sceneId } = action.payload
    this._session.userShell.actions.input.axis(event, sceneId)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{event: KeyEvent, down: boolean}}}action
   * @return {*}
   */
  [inputKey] (store, next, action) {
    const { event, down } = action.payload
    this._session.userShell.actions.input.key(event, down)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:string}}action
   * @return {*}
   */
  [refreshScene] (store, next, action) {
    const sceneId = action.payload
    this._session.userShell.actions.refreshScene(sceneId)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:string}}action
   * @return {*}
   */
  [notifyUserSurfaceInactive] (store, next, action) {
    const userSurfaceKey = action.payload
    const userSurface = store.getState().compositor.userSurfaces[userSurfaceKey]
    this._session.userShell.actions.notifyInactive(userSurface)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:string}}action
   * @return {*}
   */
  [userSurfaceKeyboardFocus] (store, next, action) {
    const userSurfaceKey = action.payload
    const userSurface = store.getState().compositor.userSurfaces[userSurfaceKey]
    this._session.userShell.actions.setKeyboardFocus(userSurface)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {name: string, id: string, type: string}}}action
   * @return {*}
   */
  [createScene] (store, next, action) {
    if (action.payload.type === 'local') {
      const id = CompositorMiddleWareReducers._uuidv4()
      const canvas = document.createElement('canvas')
      canvas.style.display = 'none'
      canvas.id = id
      document.body.appendChild(canvas)
      this._session.userShell.actions.initScene(id, canvas)
      action.payload.id = id
    }
    const result = next(action)
    store.dispatch(makeSceneActive(action.payload.id))
    return result
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: string}}action
   */
  [destroyScene] (store, next, action) {
    const id = action.payload
    const canvas = document.getElementById(id)
    canvas.parentElement.removeChild(canvas)
    const result = next(action)
    this._session.userShell.actions.destroyScene(id)
    return result
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: UserSurface}}action
   */
  [createUserSurface] (store, next, action) {
    action.payload = CompositorMiddleWareReducers._updateLastActiveTimeStamp(action.payload)
    const userSurface = action.payload
    const sceneId = store.getState().compositor.activeSceneId
    const result = next(action)
    store.dispatch(createUserSurfaceView({ userSurfaceKey: userSurface.key, sceneId }))
    return result
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: UserSurface}}action
   */
  [updateUserSurface] (store, next, action) {
    action.payload = CompositorMiddleWareReducers._updateLastActiveTimeStamp(action.payload)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: string}}action
   */
  [destroyUserSurface] (store, next, action) {
    const compositorState = store.getState().compositor
    const userSurfaceKey = action.payload

    const userSeat = { ...compositorState.seat }
    if (userSeat.pointerGrab && userSeat.pointerGrab === userSurfaceKey) {
      userSeat.pointerGrab = null
    }
    if (userSeat.keyboardFocus && userSeat.keyboardFocus === userSurfaceKey) {
      userSeat.keyboardFocus = null
    }
    store.dispatch(updateUserSeat(userSeat))

    const payloads = Object.keys(store.getState().compositor.scenes).map(sceneId => ({ userSurfaceKey, sceneId }))
    payloads.forEach(payload => store.dispatch(destroyUserSurfaceView(payload)))

    return next(action)
  }

  [updateUserConfiguration] (store, next, action) {
    this._session.userShell.actions.setUserConfiguration({ ...store.getState().compositor.userConfiguration, ...action.payload })
    next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: string}}action
   */
  [terminateClient] (store, next, action) {
    const clientId = action.payload
    this._session.userShell.actions.closeClient({ id: clientId })
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {url: string, type: 'web'|'remote'}}}action
   */
  [launchApp] (store, next, action) {
    const { firebase, appId } = action.payload
    const { type, url, title } = store.getState().firebase.data.apps[appId]

    if (this._remoteAppLauncher && type === 'remote') {
      this._remoteAppLauncher
        .launch(new URL(url), appId)
        .catch(function (error) {
          store.dispatch(showNotification({
            variant: 'error',
            message: `${title} failed to launch. ${error.message}`
          }))
        })
    } else if (this._webAppLauncher && type === 'web') {
      firebase.storage().refFromURL(url).getDownloadURL().then(downloadURL => {
        this._webAppLauncher
          .launch(new URL(downloadURL))
          .catch(function (error) {
            // TODO A full list of error codes is available at https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case 'storage/object-not-found':
                store.dispatch(showNotification({
                  variant: 'error',
                  message: `${title} application could not be found on server.`
                }))
                break
              case 'storage/unauthorized':
                store.dispatch(showNotification({ variant: 'error', message: `Not authorized to launch ${title}.` }))
                break
              case 'storage/unknown':
              default:
                store.dispatch(showNotification({
                  variant: 'error',
                  message: `${title} failed to launch. ${error.message}`
                }))
                break
            }
          })
      })
      next(action)
    }
  }
}

const compositorMiddleWareReducers = CompositorMiddleWareReducers.create()
const compositorMiddleware = store => next => action => {
  if (compositorMiddleWareReducers[action.type]) {
    compositorMiddleWareReducers[action.type](store, next, action)
  } else {
    next(action)
  }
}

export default compositorMiddleware
