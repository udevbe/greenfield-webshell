import { createAction, createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{id:number, clientId: string, title:string, appId:string, mapped:boolean, active: boolean, unresponsive: boolean, minimized: boolean, key: string, lastActive: number}}UserSurface
 */
/**
 * @typedef {{userSurfaceKey:string, sceneId: string}}UserSurfaceView
 */
/**
 * @typedef {{views: UserSurfaceView[], sharing: 'public'|'private', shared_with: string[]}}LocalSceneState
 */
/**
 * @typedef {{shared_by: string, access: 'pending'|'granted'|'denied', scaling: { x: number, y: number}}}RemoteSceneState
 */
/**
 * @typedef {{name: string, id: string, type: 'local'|'remote', lastActive: number, state: LocalSceneState|RemoteSceneState}}Scene
 */
/**
 * @typedef {{id:number, variant: 'web'|'remote'}}WaylandClient
 */
/**
 * Keyboard keymap information ie keyboard layout
 * @typedef {{name: string, rules: string, model: string, layout: string, variant: string, options: string}}nrmlvo
 */
/**
 * @typedef {{nrmlvoEntries: nrmlvo[], defaultNrmlvo: nrmlvo}}UserKeyboard
 */
/**
 * @typedef {{pointerGrab: ?string, keyboardFocus: ?string, userKeyboard: UserKeyboard}}UserSeat
 */
/**
 * @typedef {{scrollFactor:number, keyboardLayout: ?string}}UserConfiguration
 */
/**
 * @typedef {{
 * clients: Object.<string,WaylandClient>,
 * initialized: boolean,
 * peerId: string,
 * seat: UserSeat,
 * userSurfaces: Object.<string,UserSurface>,
 * userConfiguration: UserConfiguration,
 * scenes: Object.<string, Scene>,
 * }}CompositorState
 */
/**
 * @type {CompositorState}
 */
const initialState = {
  clients: {},
  initialized: false,
  peerId: null,
  seat: {
    pointerGrab: null,
    keyboardFocus: null,
    keyboard: {
      nrmlvoEntries: [],
      defaultNrmlvo: null
    }
  },
  userSurfaces: {},
  userConfiguration: {
    scrollFactor: 1,
    keyboardLayoutName: null
  },
  scenes: {}
}

/**
 * @typedef {{type:string,payload:*}}Action
 */
const reducers = {
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  initializeCompositor: (state, action) => {
    const { peerId } = action.payload
    state.peerId = peerId
    state.initialized = true
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  createClient: (state, action) => {
    const client = action.payload
    state.clients[client.id] = client
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  destroyClient: (state, action) => {
    const client = action.payload
    delete state.clients[client.id]
  },

  // TODO upsert?
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  createUserSurface: (state, action) => {
    // TODO put userSurface in property
    const userSurface = action.payload
    state.userSurfaces[userSurface.key] = userSurface
  },

  // TODO upsert?
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  updateUserSurface: (state, action) => {
    // TODO put userSurface in property
    const userSurface = action.payload
    state.userSurfaces[userSurface.key] = userSurface
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  destroyUserSurface: (state, action) => {
    const userSurfaceKey = action.payload
    delete state.userSurfaces[userSurfaceKey]
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  updateUserSeat: (state, action) => {
    const { keyboardFocus, pointerGrab, keyboard } = action.payload
    state.seat = { pointerGrab, keyboardFocus, keyboard }
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  updateUserConfiguration: (state, action) => {
    state.userConfiguration = { ...state.userConfiguration, ...action.payload }
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  createUserSurfaceView: (state, action) => {
    const { userSurfaceKey, sceneId } = action.payload
    state.scenes[sceneId].state.views.push({ userSurfaceKey, sceneId })
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  destroyUserSurfaceView: (state, action) => {
    const { userSurfaceKey, sceneId } = action.payload
    state.scenes[sceneId].state.views = state.scenes[sceneId].state.views.filter(view =>
      view.userSurfaceKey !== userSurfaceKey && view.sceneId !== sceneId)
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  createScene: (state, action) => {
    const { name, id, type } = action.payload
    const scene = { name, id, type }
    if (type === 'local') {
      scene.state = /** @type{LocalSceneState} */{ views: [], sharing: 'private', shared_with: [] }
    } else if (type === 'remote') {
      scene.state = /** @type{RemoteSceneState} */{ shared_by: null, access: 'pending', scaling: { x: 1, y: 1 } }
    }
    state.scenes[id] = scene
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  destroyScene: (state, action) => {
    const id = action.payload
    delete state.scenes[id]
  },

  /**
   * @param {CompositorState}state
   * @param {{payload: {grantingUserId: string, remoteSceneId: string}}}action
   */
  grantedSceneAccess: (state, action) => {
    const { grantingUserId, sceneId } = action.payload
    state.scenes[sceneId].state.access = 'granted'
    state.scenes[sceneId].state.shared_by = grantingUserId
  },

  /**
   * @param {CompositorState}state
   * @param {{payload: {remoteSceneId: string}}}action
   */
  deniedSceneAccess: (state, action) => {
    const { sceneId } = action.payload
    state.scenes[sceneId].state.access = 'denied'
    state.scenes[sceneId].state.shared_by = null
  },

  /**
   * @param {CompositorState}state
   * @param {{payload: {localSceneId: string, requestingUserId:string, peerId:string, remoteSceneId:string, access: 'denied'|'granted'}}}action
   */
  requestedSceneAccess: (state, action) => {
    const { sceneId, requestingUserId, access } = action.payload
    const scene = state.scenes[sceneId]
    if (access === 'granted') {
      scene.state.shared_with.push(requestingUserId)
    } else if (access === 'denied') {
      scene.state.shared_with = scene.state.shared_with.filter(uid => uid !== requestingUserId)
    }
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  changeSceneName: (state, action) => {
    const { sceneId, name } = action.payload
    state.scenes[sceneId].name = name
  },

  /**
   * @param {CompositorState}state
   * @param {{payload: {sceneId: string, sharing: string}}}action
   */
  shareScene: (state, action) => {
    const { sceneId, sharing } = action.payload
    state.scenes[sceneId].state.sharing = sharing
  },

  /**
   * @param {CompositorState}state
   * @param {{payload: {sceneId: string, x: number, y: number}}}action
   */
  setRemoteSceneScaling: (state, action) => {
    const { sceneId, x, y } = action.payload
    state.scenes[sceneId].state.scaling = { x, y }
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  markSceneLastActive: (state, action) => {
    const id = action.payload
    Object.values(state.scenes).find(scene => scene.id === id).lastActive = Date.now()
  }
}

// actions handled by compositor middleware

/**
 * @type {function(payload: Object):string}
 */
export const remotePointerMove = createAction('greenfield/compositor/remotePointerMove')
/**
 * @type {function(payload: Object):string}
 */
export const remoteButtonUp = createAction('greenfield/compositor/remoteButtonUp')
/**
 * @type {function(payload: Object):string}
 */
export const remoteButtonDown = createAction('greenfield/compositor/remoteButtonDown')
/**
 * @type {function(payload: Object):string}
 */
export const remoteAxis = createAction('greenfield/compositor/remoteAxis')
/**
 * @type {function(payload: Object):string}
 */
export const remoteKey = createAction('greenfield/compositor/remoteKey')

/**
 * @type {function(payload: string):string}
 */
export const sendRemoteSceneUpdate = createAction('greenfield/compositor/sendRemoteSceneUpdate')

/**
 * @type {function(payload: string):string}
 */
export const requestUserSurfaceActive = createAction('greenfield/compositor/requestUserSurfaceActive')

/**
 * @type {function(payload: string):string}
 */
export const refreshScene = createAction('greenfield/compositor/refreshScene')

/**
 * @type {function(payload: {sceneId: string}):string}
 */
export const requestingSceneAccess = createAction('greenfield/compositor/requestingSceneAccess')

/**
 * @type {function(payload: string):string}
 */
export const notifyUserSurfaceInactive = createAction('greenfield/compositor/notifyUserSurfaceInactive')

/**
 * @type {function(payload: string):string}
 */
export const userSurfaceKeyboardFocus = createAction('greenfield/compositor/userSurfaceKeyboardFocus')

/**
 * @type {function(payload: string):string}
 */
export const terminateClient = createAction('greenfield/compositor/terminateClient')

/**
 * @type {function(payload: {url: string, type: 'web'|'remote'}):string}
 */
export const launchApp = createAction('greenfield/compositor/launchApp')

// TODO application launching

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/compositor'
})

export const {
  initializeCompositor,

  createClient,
  destroyClient,

  createUserSurface,
  updateUserSurface,
  destroyUserSurface,

  updateUserSeat,

  updateUserConfiguration,
  createUserSurfaceView,
  destroyUserSurfaceView,

  createScene,
  requestedSceneAccess,
  grantedSceneAccess,
  deniedSceneAccess,
  changeSceneName,
  shareScene,
  destroyScene,
  markSceneLastActive,
  setRemoteSceneScaling
} = slice.actions

export default slice.reducer
