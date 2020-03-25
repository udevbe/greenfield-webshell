import CompositorModule from './CompositorModule'
import { showNotification } from '../../store/notification'
import {
  cleanUpDestroyedClient,
  createClient,
  createScene,
  createUserSurface,
  createUserSurfaceView,
  destroyScene,
  destroyUserSurface,
  destroyUserSurfaceView,
  initializeCompositor,
  markSceneLastActive,
  updateUserConfiguration,
  updateUserSeat,
  updateUserSurface
} from '../../store/compositor'
import { uuidv4 } from './index'
import {
  launchRemoteApp,
  launchWebApp,
  notifyUserSurfaceInactive,
  refreshScene,
  requestUserSurfaceActive,
  sendRemoteSceneUpdate,
  terminateClient,
  userSurfaceKeyboardFocus
} from './actions'

class CompositorMiddleWare {
  /**
   * @return {CompositorMiddleWare}
   */
  static create () {
    const compositorModule = CompositorModule.create()
    return new CompositorMiddleWare(compositorModule)
  }

  /**
   * @param {UserSurface}userSurface
   * @return {string}
   * @private
   */
  static _userSurfaceKey (userSurface) {
    return userSurface === null ? null : `${userSurface.id}@${userSurface.clientId}`
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
     * @type {boolean}
     * @private
     */
    this._initializing = false

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
     */
    this.session = null
    /**
     * @type {function(mouseEvent: MouseEvent, released: boolean, sceneId: string):Object}
     */
    this.createButtonEventFromMouseEvent = null
    /**
     * @type {function(wheelEvent: WheelEvent, sceneId: string):Object}
     */
    this.createAxisEventFromWheelEvent = null
    /**
     * @type {function(keyboardEvent: KeyboardEvent, down: boolean):Object}
     */
    this.createKeyEventFromKeyboardEvent = null
  }

  _linkUserShellEvents (store) {
    const userShell = this.session.userShell
    userShell.events.notify = (variant, message) => store.dispatch(showNotification({ variant, message }))

    userShell.events.createApplicationClient = client => store.dispatch(createClient({ ...client }))
    userShell.events.destroyApplicationClient = client => store.dispatch(cleanUpDestroyedClient({ ...client }))

    userShell.events.createUserSurface = (userSurface, userSurfaceState) => {
      store.dispatch(createUserSurface({
        ...userSurface,
        ...userSurfaceState,
        key: CompositorMiddleWare._userSurfaceKey(userSurface)
      }))
    }
    userShell.events.updateUserSurface = (userSurface, userSurfaceState) => {
      store.dispatch(updateUserSurface({
        ...userSurface,
        ...userSurfaceState,
        key: CompositorMiddleWare._userSurfaceKey(userSurface)
      }))
    }
    userShell.events.destroyUserSurface = userSurface => {
      store.dispatch(destroyUserSurface(CompositorMiddleWare._userSurfaceKey(userSurface)))
    }
    userShell.events.updateUserSeat = userSeatState => {
      const { keyboardFocus, pointerGrab } = userSeatState
      const userSeat = store.getState().compositor.seat
      store.dispatch(updateUserSeat({
        ...userSeat,
        keyboardFocus: CompositorMiddleWare._userSurfaceKey(keyboardFocus),
        pointerGrab: CompositorMiddleWare._userSurfaceKey(pointerGrab)
      }))
    }

    userShell.events.sceneRefresh = sceneId => store.dispatch(sendRemoteSceneUpdate(sceneId))
  }

  _restoreUserConfiguration (store) {
    const compositorState = store.getState().compositor
    const userConfiguration = compositorState.userConfiguration
    this.session.userShell.actions.setUserConfiguration(userConfiguration)
  }

  _initializeUserSeat (store) {
    const userSeat = store.getState().compositor.seat
    store.dispatch(updateUserSeat({
      ...userSeat,
      keyboard: {
        nrmlvoEntries: [...this.session.globals.seat.keyboard.nrmlvoEntries],
        defaultNrmlvo: this.session.globals.seat.keyboard.defaultNrmlvo
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
    if (!compositorState.initialized && !this._initializing) {
      this._initializing = true

      const compositorInit = this._compositorModule.then(({
        remoteAppLauncher,
        webAppLauncher,
        session,
        createButtonEventFromMouseEvent,
        createAxisEventFromWheelEvent,
        createKeyEventFromKeyboardEvent
      }) => {
        this._remoteAppLauncher = remoteAppLauncher
        this._webAppLauncher = webAppLauncher
        this.session = session

        this.createButtonEventFromMouseEvent = createButtonEventFromMouseEvent
        this.createAxisEventFromWheelEvent = createAxisEventFromWheelEvent
        this.createKeyEventFromKeyboardEvent = createKeyEventFromKeyboardEvent

        this._linkUserShellEvents(store)
        this._initializeUserSeat(store)
        this._createDefaultWorkspace(store)
        this._restoreUserConfiguration(store)

        this.session.globals.register()
      })

      compositorInit.then(() => {
        next(action)
        this._initializing = false
      })
    }
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:string}}action
   * @return {*}
   */
  [requestUserSurfaceActive] (store, next, action) {
    const userSurfaceKey = action.payload
    const compositorState = store.getState().compositor
    const userSurface = compositorState.userSurfaces[userSurfaceKey]
    this.session.userShell.actions.requestActive(userSurface)

    const scenesWithSurface = Object.values(compositorState.scenes).filter(scene => scene.views.some(view => view.userSurfaceKey === userSurface.key))
    scenesWithSurface.forEach(scene => this.session.userShell.actions.raise(userSurface, scene.id))

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
    const compositorState = store.getState().compositor
    const scene = compositorState.scenes[sceneId]
    if (scene.type === 'local') {
      this.session.userShell.actions.refreshScene(sceneId)
    }
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
    if (userSurface) {
      this.session.userShell.actions.notifyInactive(userSurface)
    }
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
    this.session.userShell.actions.setKeyboardFocus(userSurface)
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {name: string, id: string, type: string}}}action
   * @return {*}
   */
  [createScene] (store, next, action) {
    const { type } = action.payload
    if (type === 'local') {
      const id = uuidv4()

      action.payload.id = id
      const sceneElement = document.createElement('canvas')
      this.session.userShell.actions.initScene(id, sceneElement)

      sceneElement.onpointermove = event => {
        event.preventDefault()
        this.session.userShell.actions.input.pointerMove(this.createButtonEventFromMouseEvent(event, null, id))
      }
      sceneElement.onpointerdown = event => {
        event.preventDefault()
        sceneElement.setPointerCapture(event.pointerId)
        this.session.userShell.actions.input.buttonDown(this.createButtonEventFromMouseEvent(event, false, id))
      }
      sceneElement.onpointerup = event => {
        event.preventDefault()
        this.session.userShell.actions.input.buttonUp(this.createButtonEventFromMouseEvent(event, true, id))
        sceneElement.releasePointerCapture(event.pointerId)
      }
      sceneElement.onwheel = event => {
        event.preventDefault()
        this.session.userShell.actions.input.axis(this.createAxisEventFromWheelEvent(event, id))
      }
      sceneElement.onkeydown = event => {
        event.preventDefault()
        this.session.userShell.actions.input.key(this.createKeyEventFromKeyboardEvent(event, true))
      }
      sceneElement.onkeyup = event => this.session.userShell.actions.input.key(event, false)

      sceneElement.onmouseover = () => sceneElement.focus()
      sceneElement.tabIndex = 1

      sceneElement.style.display = 'none'
      sceneElement.id = id
      document.body.appendChild(sceneElement)

      next(action)
      store.dispatch(markSceneLastActive({ sceneId: id }))
      return id
    } else {
      return next(action)
    }
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {sceneId: string}}}action
   */
  [markSceneLastActive] (store, next, action) {
    action.payload.lastActive = Date.now()
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: string}}action
   */
  [destroyScene] (store, next, action) {
    const id = action.payload
    const compositorState = store.getState().compositor
    const scenes = Object.values(compositorState.scenes)

    const newActiveSceneId = scenes
      .filter(scene => scene.id !== id)
      .reduce((previousValue, currentValue) => previousValue.lastActive > currentValue.lastActive ? previousValue : currentValue).id
    const canvas = document.getElementById(id)
    canvas.parentElement.removeChild(canvas)
    this.session.userShell.actions.destroyScene(id)
    next(action)
    return newActiveSceneId
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: UserSurface}}action
   */
  [createUserSurface] (store, next, action) {
    action.payload = CompositorMiddleWare._updateLastActiveTimeStamp(action.payload)
    const userSurface = action.payload
    const sceneId = Object.values(store.getState().compositor.scenes).reduce((previousValue, currentValue) => previousValue.lastActive > currentValue.lastActive ? previousValue : currentValue).id
    const result = next(action)
    store.dispatch(createUserSurfaceView({ userSurfaceKey: userSurface.key, sceneId }))
    store.dispatch(requestUserSurfaceActive(userSurface.key))
    return result
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: UserSurface}}action
   */
  [updateUserSurface] (store, next, action) {
    const userSurface = action.payload
    action.payload = CompositorMiddleWare._updateLastActiveTimeStamp(userSurface)
    next(action)

    const compositorState = store.getState().compositor
    const scenesWithSurface = Object.values(compositorState.scenes).filter(scene => scene.views.some(view => view.userSurfaceKey === userSurface.key))
    const lastActiveSceneWithSurface = scenesWithSurface.reduce((previousValue, currentValue) => previousValue.lastActive > currentValue.lastActive ? previousValue : currentValue)
    store.dispatch(markSceneLastActive({ sceneId: lastActiveSceneWithSurface.id }))
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: UserSurface}}action
   */
  [createUserSurfaceView] (store, next, action) {
    const { userSurfaceKey, sceneId } = action.payload
    const compositorState = store.getState().compositor
    const userSurface = compositorState.userSurfaces[userSurfaceKey]
    this.session.userShell.actions.createView(userSurface, sceneId)
    next(action)
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
    this.session.userShell.actions.setUserConfiguration({ ...store.getState().compositor.userConfiguration, ...action.payload })
    next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: string}}action
   */
  [terminateClient] (store, next, action) {
    const clientId = action.payload
    this.session.userShell.actions.closeClient({ id: clientId })
    return next(action)
  }

  [cleanUpDestroyedClient] (store, next, action) {
    const client = action.payload
    Object.values(store.getState().compositor.userSurfaces)
      .filter(userSurface => userSurface.clientId === client.id)
      .forEach(userSurface => store.dispatch(destroyUserSurface(userSurface.key)))
    next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {appId: string, url: string}}}action
   */
  [launchRemoteApp] (store, next, action) {
    const { appId, url, title } = action.payload
    this._remoteAppLauncher
      .launch(new URL(url), appId)
      .catch(function (error) {
        // TODO dispatch launch failure action for app instead
        store.dispatch(showNotification({
          variant: 'error',
          message: `${title} failed to launch. ${error.message}`
        }))
      })
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {appId: string}}}action
   */
  [launchWebApp] (store, next, action) {
    const { downloadURL, title } = action.payload

    this._webAppLauncher
      .launch(new URL(downloadURL))
      .catch(function (error) {
        // TODO A full list of error codes is available at https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          // TODO dispatch launch failure action for app instead
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
  }
}

export default CompositorMiddleWare
