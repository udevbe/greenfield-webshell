import { showNotification } from '../../store/notification'
import {
  compositorInitialized,
  compositorInitializing,
  createClient,
  createScene,
  createUserSurface,
  createUserSurfaceView,
  destroyClient,
  destroyScene,
  destroyUserSurface,
  destroyUserSurfaceView,
  inputAxis,
  inputButtonDown,
  inputButtonUp,
  inputKey,
  inputPointerMove,
  makeSceneActive,
  notifyUserSurfaceInactive,
  raiseUserSurfaceView,
  refreshScene,
  requestUserSurfaceActive,
  updateUserSeat,
  updateUserSurface,
  userSurfaceKeyboardFocus
} from '../../store/compositor'

const importCompositorModule = import('compositor-module')

/**
 * @returns {string}
 * @private
 */
function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

/**
 * @param {UserSurface}userSurface
 * @return {UserSurface}
 */
function withUserSurfaceMetaData (userSurface) {
  // add key
  const userSurfaceWithKey = userSurface ? { ...userSurface, key: `${userSurface.id}@${userSurface.clientId}` } : null
  // add last active timestamp
  if (userSurfaceWithKey && userSurfaceWithKey.active) {
    userSurfaceWithKey.lastActive = Date.now()
  }
  return userSurfaceWithKey
}

// TODO move to store
/**
 * @type {{remoteAppLauncher: null, webAppLauncher: null, globals: null, actions: null}}
 */
const compositorSession = { globals: null, webAppLauncher: null, remoteAppLauncher: null, actions: null }

/**
 * @param store
 * @param initWasm
 * @param RemoteAppLauncher
 * @param RemoteSocket
 * @param Session
 * @param WebAppLauncher
 * @param WebAppSocket
 */
function initCompositor (
  store,
  {
    initWasm,
    RemoteAppLauncher,
    RemoteSocket,
    Session,
    WebAppLauncher,
    WebAppSocket
  }) {
  initWasm().then(() => {
    const session = Session.create()
    const userShell = session.userShell

    userShell.events.notify = (variant, message) => store.dispatch(showNotification({ variant, message }))

    userShell.events.createApplicationClient = client => store.dispatch(createClient({ ...client }))
    userShell.events.destroyApplicationClient = client => store.dispatch(destroyClient({ ...client }))

    userShell.events.createUserSurface = (userSurface, userSurfaceState) => {
      store.dispatch(createUserSurface({
        ...userSurface,
        ...userSurfaceState
      }))
    }
    userShell.events.updateUserSurface = (userSurface, userSurfaceState) => {
      store.dispatch(updateUserSurface({ ...userSurface, ...userSurfaceState }))
    }
    userShell.events.destroyUserSurface = userSurface => { store.dispatch(destroyUserSurface({ ...userSurface })) }
    userShell.events.updateUserSeat = userSeatState => { store.dispatch(updateUserSeat({ ...userSeatState })) }

    const webAppSocket = WebAppSocket.create(session)
    const webAppLauncher = WebAppLauncher.create(webAppSocket)

    const remoteSocket = RemoteSocket.create(session)
    const remoteAppLauncher = RemoteAppLauncher.create(session, remoteSocket)

    compositorSession.webAppLauncher = webAppLauncher
    compositorSession.remoteAppLauncher = remoteAppLauncher

    // TODO move to middleware reducers
    compositorSession.actions = userShell.actions

    store.dispatch(compositorInitialized())
    store.dispatch(createScene({ name: 'default', type: 'local' }))

    session.globals.register()
  })
}

/**
 * @param store
 */
function ensureCompositor (store) {
  const compositorState = store.getState().compositor
  const isInitialized = compositorState.initialized
  const isInitializing = compositorState.initializing
  const userConfiguration = compositorState.userConfiguration

  if (isInitialized && userConfiguration) {
    compositorSession.actions.setUserConfiguration(userConfiguration)
  }

  if (!isInitialized && !isInitializing) {
    store.dispatch(compositorInitializing())
    importCompositorModule.then(exports => initCompositor(store, exports))
  }
}

const compositorMiddleWareReducers = {
  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:UserSurfaceView}}action
   * @return {*}
   */
  [raiseUserSurfaceView]: (store, next, action) => {
    const { userSurface, sceneId } = action.payload
    compositorSession.actions.raise(userSurface, sceneId)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:UserSurface}}action
   * @return {*}
   */
  [requestUserSurfaceActive]: (store, next, action) => {
    const userSurface = action.payload
    compositorSession.actions.requestActive(userSurface)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{event: MouseEvent, sceneId: string}}}action
   * @return {*}
   */
  [inputPointerMove]: (store, next, action) => {
    const { event, sceneId } = action.payload
    compositorSession.actions.input.pointerMove(event, sceneId)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{event: MouseEvent, sceneId: string}}}action
   * @return {*}
   */
  [inputButtonDown]: (store, next, action) => {
    const { event, sceneId } = action.payload
    compositorSession.actions.input.buttonDown(event, sceneId)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{event: MouseEvent, sceneId: string}}}action
   * @return {*}
   */
  [inputButtonUp]: (store, next, action) => {
    const { event, sceneId } = action.payload
    compositorSession.actions.input.buttonUp(event, sceneId)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{event: WheelEvent, sceneId: string}}}action
   * @return {*}
   */
  [inputAxis]: (store, next, action) => {
    const { event, sceneId } = action.payload
    compositorSession.actions.input.axis(event, sceneId)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{event: KeyEvent, down: boolean}}}action
   * @return {*}
   */
  [inputKey]: (store, next, action) => {
    const { event, down } = action.payload
    compositorSession.actions.input.key(event, down)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:string}}action
   * @return {*}
   */
  [refreshScene]: (store, next, action) => {
    const sceneId = action.payload
    compositorSession.actions.refreshScene(sceneId)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:UserSurface}}action
   * @return {*}
   */
  [notifyUserSurfaceInactive]: (store, next, action) => {
    const userSurface = action.payload
    compositorSession.actions.notifyInactive(userSurface)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:UserSurface}}action
   * @return {*}
   */
  [userSurfaceKeyboardFocus]: (store, next, action) => {
    const userSurface = action.payload
    compositorSession.actions.setKeyboardFocus(userSurface)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {name: string, id: string, type: string}}}action
   * @return {*}
   */
  [createScene]: (store, next, action) => {
    if (action.payload.type === 'local') {
      const id = uuidv4()
      const canvas = document.createElement('canvas')
      canvas.style.display = 'none'
      canvas.id = id
      document.body.appendChild(canvas)
      compositorSession.actions.initScene(id, canvas)
      action.payload.id = id
    }
    store.dispatch(makeSceneActive(action.payload.id))
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: string}}action
   */
  [destroyScene]: (store, next, action) => {
    const id = action.payload
    const canvas = document.getElementById(id)
    canvas.parentElement.removeChild(canvas)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: UserSurface}}action
   */
  [createUserSurface]: (store, next, action) => {
    action.payload = withUserSurfaceMetaData(action.payload)
    const userSurface = action.payload
    const sceneId = store.getState().compositor.activeSceneId
    store.dispatch(createUserSurfaceView({ userSurface, sceneId }))
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: UserSurface}}action
   */
  [updateUserSurface]: (store, next, action) => {
    action.payload = withUserSurfaceMetaData(action.payload)
    return next(action)
  },

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: string}}action
   */
  [destroyUserSurface]: (store, next, action) => {
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
}

const compositor = store => {
  ensureCompositor(store)

  return next => action => {
    const middleWareReducer = compositorMiddleWareReducers[action.type]
    return middleWareReducer ? middleWareReducer(store, next, action) : next(action)
  }
}

export default compositor
