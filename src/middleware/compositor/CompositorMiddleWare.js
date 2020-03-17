import CompositorModule from './CompositorModule'
import { showNotification } from '../../store/notification'
import {
  createClient,
  createScene,
  createUserSurface,
  createUserSurfaceView,
  deniedSceneAccess,
  destroyClient,
  destroyScene,
  destroyUserSurface,
  destroyUserSurfaceView,
  grantedSceneAccess,
  initializeCompositor,
  launchApp,
  markSceneLastActive,
  notifyUserSurfaceInactive,
  refreshScene,
  requestedSceneAccess,
  requestingSceneAccess,
  requestUserSurfaceActive,
  terminateClient,
  updateUserConfiguration,
  updateUserSeat,
  updateUserSurface,
  userSurfaceKeyboardFocus
} from '../../store/compositor'
import Peer from 'peerjs'

class CompositorMiddleWare {
  /**
   * @return {CompositorMiddleWare}
   */
  static create () {
    const compositorModule = CompositorModule.create()
    return new CompositorMiddleWare(compositorModule)
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
     * @private
     */
    this._session = null
    /**
     * @type {Object.<string,Peer.DataConnection>}
     * @private
     */
    this._dataConnections = {}
    /**
     * @type {Peer}
     * @private
     */
    this._peer = null
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
    if (!compositorState.initialized && !this._initializing) {
      this._initializing = true
      this._compositorModule.then(({ remoteAppLauncher, webAppLauncher, session }) => {
        this._remoteAppLauncher = remoteAppLauncher
        this._webAppLauncher = webAppLauncher
        this._session = session

        this._linkUserShellEvents(store)
        this._initializeUserSeat(store)
        this._createDefaultWorkspace(store)
        this._restoreUserConfiguration(store)

        this._session.globals.register()

        this._peer = new Peer(CompositorMiddleWare._uuidv4())
        this._peer.on('connection', dataConnection => {
          this._dataConnections[dataConnection.peer] = dataConnection

          dataConnection.on('data', data => {
            // TODO we probably want a bit of message sanity checking here
            const action = JSON.parse(data)
            action.payload.peerId = dataConnection.peer
            next(action)
          })

          dataConnection.on('close', () => {
            delete this._dataConnections[dataConnection.peer]
          })
        })
        this._peer.on('call', mediaConnection => {
          const { sceneId } = mediaConnection.metadata
          mediaConnection.on('stream', stream => {
            const video = /** @type {HTMLVideoElement} */document.getElementById(sceneId)
            video.srcObject = stream
          })
        })

        next(action)
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
    this._session.userShell.actions.requestActive(userSurface)
    const lastActiveSceneId = Object.values(store.getState().compositor.scenes).reduce((previousValue, currentValue) => previousValue.lastActive > currentValue.lastActive ? previousValue : currentValue).id
    this._session.userShell.actions.raise(userSurface, lastActiveSceneId)
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
    if (compositorState.scenes[sceneId].type === 'local') {
      this._session.userShell.actions.refreshScene(sceneId)
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
      this._session.userShell.actions.notifyInactive(userSurface)
      return next(action)
    }
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
   * @param {{payload:{sceneId: string, peerId: string}}}action
   * @return {*}
   */
  [requestingSceneAccess] (store, next, action) {
    const { sceneId, peerId } = action.payload
    store.dispatch(createScene({ name: 'remote', type: 'remote' }))
    this._send(peerId, JSON.stringify(requestedSceneAccess({ sceneId })))
  }

  /**
   * @param {string}peerId
   * @param {string}message
   * @private
   */
  _send (peerId, message) {
    const dataConnection = this._dataConnections[peerId]
    if (dataConnection && dataConnection.open) {
      dataConnection.send(message)
    } else if (dataConnection && !dataConnection.open) {
      dataConnection.on('open', () => this._send(peerId, message))
    } else if (!dataConnection) {
      this._dataConnections[peerId] = this._peer.connect(peerId, { reliable: true })
      this._send(peerId, message)
    }
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {sceneId: string, peerId: string}}}action
   * @return {*}
   */
  [requestedSceneAccess] (store, next, action) {
    const { sceneId, peerId } = action.payload
    const firebaseState = store.getState().firebase
    const compositorState = store.getState().compositor

    const scene = compositorState.scenes[sceneId]
    if (scene && scene.type === 'local' && scene.sharing === 'public') {
      action.payload.access = 'granted'
      this._send(peerId, JSON.stringify(grantedSceneAccess({
        grantingUserId: firebaseState.auth.uid,
        sceneId
      })))

      const canvas = /** @type {HTMLCanvasElement} */ document.getElementById(sceneId)
      // TODO pass in a framerate of 0 and explicitly sync with scene repaint
      const sceneVideoStream = canvas.captureStream()
      const sceneCall = this._peer.call(peerId, sceneVideoStream, { metadata: { sceneId } })

      sceneCall.on('close', () => {
        action.payload.access = 'denied'
        next(action)
      })
    } else {
      action.payload.access = 'denied'
      this._send(peerId, JSON.stringify(deniedSceneAccess({ sceneId })))
    }
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {name: string, id: string, type: string}}}action
   * @return {*}
   */
  [createScene] (store, next, action) {
    const id = CompositorMiddleWare._uuidv4()
    action.payload.id = id
    const { type } = action.payload

    let sceneElement = null
    if (type === 'local') {
      sceneElement = document.createElement('canvas')
      this._session.userShell.actions.initScene(id, sceneElement)

      sceneElement.onpointermove = event => this._session.userShell.actions.input.pointerMove(event, id)
      sceneElement.onpointerdown = event => {
        sceneElement.setPointerCapture(event.pointerId)
        this._session.userShell.actions.input.buttonDown(event, id)
      }
      sceneElement.onpointerup = event => {
        this._session.userShell.actions.input.buttonUp(event, id)
        sceneElement.releasePointerCapture(event.pointerId)
      }
      sceneElement.onwheel = event => this._session.userShell.actions.input.axis(event, id)
      sceneElement.onkeydown = event => this._session.userShell.actions.input.key(event, true)
      sceneElement.onkeyup = event => this._session.userShell.actions.input.key(event, false)
    } else if (type === 'remote') {
      sceneElement = document.createElement('video')

      sceneElement.onpointermove = event => { /* send event over connection */ }
      sceneElement.onpointerdown = event => {
        sceneElement.setPointerCapture(event.pointerId)
        /* send event over connection */
      }
      sceneElement.onpointerup = event => {
        this._session.userShell.actions.input.buttonUp(event, id)
        /* send event over connection */
      }
      sceneElement.onwheel = event => { /* send event over connection */ }
      sceneElement.onkeydown = event => { /* send event over connection */ }
      sceneElement.onkeyup = event => { /* send event over connection */ }
    } else {
      // TODO error unknown type?
      return
    }

    sceneElement.onmouseover = () => sceneElement.focus()
    sceneElement.tabIndex = 1

    sceneElement.style.display = 'none'
    sceneElement.id = id
    document.body.appendChild(sceneElement)

    next(action)
    store.dispatch(markSceneLastActive(id))
    return id
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
    this._session.userShell.actions.destroyScene(id)
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
    action.payload = CompositorMiddleWare._updateLastActiveTimeStamp(action.payload)
    return next(action)
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
    this._session.userShell.actions.createView(userSurface, sceneId)
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

  [destroyClient] (store, next, action) {
    const client = action.payload
    Object.values(store.getState().compositor.userSurfaces)
      .filter(userSurface => userSurface.clientId === client.id)
      .forEach(userSurface => store.dispatch(destroyUserSurface(userSurface.key)))
    next(action)
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

export default CompositorMiddleWare
