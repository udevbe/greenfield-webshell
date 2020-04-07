import { createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {CompositorSurfaceState & CompositorSurface & {key: UserShellSurfaceKey}}UserShellSurface
 */
/**
 * @typedef {{surfaceKey:UserShellSurfaceKey, sceneId: string}}UserShellSurfaceView
 */
/**
 * @typedef {{, sharing: 'public'|'private', shared_with: string[]}}LocalUserShellSceneState
 */
/**
 * @typedef {{shared_by: string, access: 'pending'|'granted'|'denied', scaling: { x: number, y: number}}}RemoteUserShellSceneState
 */
/**
 * @typedef {{views: UserShellSurfaceView[], name: string, id: string, type: 'local'|'remote', lastActive: number, state: LocalUserShellSceneState|RemoteUserShellSceneState}}UserShellScene
 */
/**
 * @typedef {CompositorClient}UserShellClient
 */
/**
 * Keyboard keymap information ie keyboard layout
 * @typedef {{name: string, rules: string, model: string, layout: string, variant: string, options: string}}nrmlvo
 */
/**
 * @typedef {{nrmlvoEntries: nrmlvo[], defaultNrmlvo: nrmlvo}}UserShellKeyboard
 */
/**
 * @typedef {{pointerGrab: ?string, keyboardFocus: ?string, userKeyboard: UserShellKeyboard}}UserShellSeat
 */
/**
 * @typedef {{scrollFactor:number, keyboardLayout: ?string}}UserShellConfiguration
 */
/**
 * @typedef {{
 * clients: Object.<string,UserShellClient>,
 * initializing: boolean,
 * initialized: boolean,
 * seat: UserShellSeat,
 * surfaces: Object.<string,UserShellSurface>,
 * configuration: UserShellConfiguration,
 * scenes: Object.<string, UserShellScene>,
 * }}UserShellCompositorState
 */
/**
 * @type {UserShellCompositorState}
 */
// TODO add app launch error state
// TODO add last active scene id state
const initialState = {
  clients: {},
  initializing: false,
  initialized: false,
  // TODO wayland supports multi seat and so should we...
  seat: {
    pointerGrab: null,
    keyboardFocus: null,
    keyboard: {
      nrmlvoEntries: [],
      defaultNrmlvo: null
    }
  },
  surfaces: {},
  configuration: {
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
   * @param {UserShellCompositorState}state
   */
  initializingUserShellCompositor: (state) => {
    // const { peerId } = action.payload
    // state.peerId = peerId
    state.initializing = true
  },

  /**
   * @param {UserShellCompositorState}state
   */
  initializedUserShellCompositor: (state) => {
    state.initializing = false
    state.initialized = true
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {UserShellClient}client
   */
  createUserShellClient: (state, { payload: { client } }) => {
    state.clients[client.id] = client
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {string}id
   */
  deleteUserShellClient: (state, { payload: { id } }) => {
    delete state.clients[id]
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {UserShellSurface}surface
   */
  createUserShellSurface: (state, { payload: { surface } }) => {
    state.surfaces[surface.key] = surface
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {UserShellSurface}surface
   */
  updateUserShellSurface: (state, { payload: { surface } }) => {
    state.surfaces[surface.key] = { ...state.surfaces[surface.key], ...surface }
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {UserShellSurfaceKey}key
   */
  deleteUserShellSurface: (state, { payload: { key } }) => {
    delete state.surfaces[key]
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {UserShellSeat}seat
   */
  updateUserShellSeat: (state, { payload: { seat } }) => {
    state.seat = { ...state.seat, ...seat }
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {UserShellConfiguration}configuration
   */
  updateUserShellConfiguration: (state, { payload: { configuration } }) => {
    state.configuration = { ...state.configuration, ...configuration }
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {UserShellSurfaceView}view
   */
  createUserShellSurfaceView: (state, { payload: { view } }) => {
    state.scenes[view.sceneId].views.push(view)
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {UserShellSurfaceView}view
   */
  deleteUserShellSurfaceView: (state, { payload: { view } }) => {
    const { sceneId, surfaceKey } = view
    state.scenes[sceneId].views = state.scenes[sceneId].views.filter(view => view.surfaceKey !== surfaceKey && view.sceneId !== sceneId)
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {UserShellScene}scene
   */
  createUserShellScene: (state, { payload: { scene } }) => {
    state.scenes[scene.id] = scene
  },

  /**
   * @param {UserShellCompositorState}state
   * @param {string}id
   */
  deleteUserShellScene: (state, { payload: { id } }) => {
    delete state.scenes[id]
  },

  // TODO refactor?
  /**
   * @param {UserShellCompositorState}state
   * @param {{payload: {grantingUserId: string, remoteSceneId: string}}}action
   */
  notifySceneAccessGrant: (state, action) => {
    const { grantingUserId, sceneId } = action.payload
    state.scenes[sceneId].state.access = 'granted'
    state.scenes[sceneId].state.shared_by = grantingUserId
  },

  // TODO refactor?
  /**
   * @param {UserShellCompositorState}state
   * @param {{payload: {remoteSceneId: string}}}action
   */
  notifySceneAccessDenied: (state, action) => {
    const { sceneId } = action.payload
    state.scenes[sceneId].state.access = 'denied'
    state.scenes[sceneId].state.shared_by = null
  },

  // TODO refactor?
  /**
   * @param {UserShellCompositorState}state
   * @param {{payload: {sceneId: string, requestingUserId:string}}}action
   */
  grantSceneAccess: (state, action) => {
    const { sceneId, requestingUserId } = action.payload
    const scene = state.scenes[sceneId]
    scene.state.shared_with.push(requestingUserId)
  },

  // TODO refactor?
  /**
   * @param {UserShellCompositorState}state
   * @param {{payload: {sceneId: string, requestingUserId:string}}}action
   */
  denySceneAccess: (state, action) => {
    const { sceneId, requestingUserId } = action.payload
    const scene = state.scenes[sceneId]
    if (scene) {
      scene.state.shared_with = scene.state.shared_with.filter(uid => uid !== requestingUserId)
    }
  },

  // TODO refactor?
  /**
   * @param {UserShellCompositorState}state
   * @param {Action}action
   */
  changeSceneName: (state, action) => {
    const { sceneId, name } = action.payload
    state.scenes[sceneId].name = name
  },

  // TODO refactor?
  /**
   * @param {UserShellCompositorState}state
   * @param {{payload: {sceneId: string, sharing: string}}}action
   */
  shareScene: (state, action) => {
    const { sceneId, sharing } = action.payload
    state.scenes[sceneId].state.sharing = sharing
  },

  // TODO refactor?
  /**
   * @param {UserShellCompositorState}state
   * @param {{payload: {sceneId: string, x: number, y: number}}}action
   */
  setRemoteSceneScaling: (state, action) => {
    const { sceneId, x, y } = action.payload
    state.scenes[sceneId].state.scaling = { x, y }
  },

  /**
   * @param {UserShellCompositorState}state
   * @param action
   */
  updateUserShellScene: (state, { payload: { scene } }) => {
    state.scenes[scene.id] = { ...state.scenes[scene.id], ...scene }
  }
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/compositor'
})

export const {
  initializingUserShellCompositor,
  initializedUserShellCompositor,

  createUserShellClient,
  deleteUserShellClient,

  createUserShellSurface,
  updateUserShellSurface,
  deleteUserShellSurface,

  updateUserShellSeat,

  updateUserShellConfiguration,

  createUserShellSurfaceView,
  deleteUserShellSurfaceView,

  createUserShellScene,
  updateUserShellScene,
  deleteUserShellScene,

  notifySceneAccessGrant,
  notifySceneAccessDenied,
  denySceneAccess,
  grantSceneAccess,
  changeSceneName,
  shareScene,

  setRemoteSceneScaling
} = slice.actions

export default slice.reducer
