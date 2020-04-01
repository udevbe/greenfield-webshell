import { createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{id:number, clientId: string, title:string, appId:string, mapped:boolean, active: boolean, unresponsive: boolean, minimized: boolean, key: string, lastActive: number, type: 'remote'|'local'}}UserSurface
 */
/**
 * @typedef {{userSurfaceKey:string, sceneId: string}}UserSurfaceView
 */
/**
 * @typedef {{, sharing: 'public'|'private', shared_with: string[]}}LocalSceneState
 */
/**
 * @typedef {{shared_by: string, access: 'pending'|'granted'|'denied', scaling: { x: number, y: number}}}RemoteSceneState
 */
/**
 * @typedef {{views: UserSurfaceView[], name: string, id: string, type: 'local'|'remote', lastActive: number, state: LocalSceneState|RemoteSceneState}}Scene
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
// TODO add app launch error state
// TODO add last active scene id state
const initialState = {
  clients: {},
  initialized: false,
  peerId: null,
  // TODO wayland supports multi seat and so should we...
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
   * @param {WaylandClient}client
   */
  clientCreated: (state, { payload: { client } }) => {
    state.clients[client.id] = client
  },

  /**
   * @param {CompositorState}state
   * @param {WaylandClient}client
   */
  clientDestroyed: (state, { payload: { client } }) => {
    delete state.clients[client.id]
  },

  /**
   * @param {CompositorState}state
   * @param {UserSurface}userSurface
   */
  createUserSurface: (state, { payload: { userSurface } }) => {
    state.userSurfaces[userSurface.key] = userSurface
  },

  /**
   * @param {CompositorState}state
   * @param {UserSurface}userSurface
   */
  updateUserSurface: (state, { payload: { userSurface } }) => {
    const oldUserSurface = state.userSurfaces[userSurface.key]
    state.userSurfaces[userSurface.key] = { ...oldUserSurface, ...userSurface }
  },

  /**
   * @param {CompositorState}state
   * @param {string}userSurfaceKey
   */
  userSurfaceDestroyed: (state, { payload: { userSurfaceKey } }) => {
    delete state.userSurfaces[userSurfaceKey]
  },

  /**
   * @param {CompositorState}state
   * @param {UserSeat}userSeat
   */
  updateUserSeat: (state, { payload: { userSeat } }) => {
    state.seat = { ...state.seat, ...userSeat }
  },

  /**
   * @param {CompositorState}state
   * @param {UserConfiguration}userConfiguration
   */
  updateUserConfiguration: (state, { payload: { userConfiguration } }) => {
    state.userConfiguration = { ...state.userConfiguration, ...userConfiguration }
  },

  /**
   * @param {CompositorState}state
   * @param {UserSurfaceView}userSurfaceView
   */
  createUserSurfaceView: (state, { payload: { userSurfaceView } }) => {
    state.scenes[userSurfaceView.sceneId].views.push(userSurfaceView)
  },

  /**
   * @param {CompositorState}state
   * @param {UserSurfaceView}userSurfaceView
   */
  destroyUserSurfaceView: (state, { payload: { userSurfaceView } }) => {
    const { sceneId, userSurfaceKey } = userSurfaceView
    state.scenes[sceneId].views = state.scenes[sceneId].views.filter(view => view.userSurfaceKey !== userSurfaceKey && view.sceneId !== sceneId)
  },

  /**
   * @param {CompositorState}state
   * @param {Scene}scene
   */
  createScene: (state, { payload: { scene } }) => {
    state.scenes[scene.id] = scene
  },

  /**
   * @param {CompositorState}state
   * @param {string}sceneId
   */
  destroyScene: (state, { payload: { sceneId } }) => {
    delete state.scenes[sceneId]
  },

  // TODO refactor?
  /**
   * @param {CompositorState}state
   * @param {{payload: {grantingUserId: string, remoteSceneId: string}}}action
   */
  notifySceneAccessGrant: (state, action) => {
    const { grantingUserId, sceneId } = action.payload
    state.scenes[sceneId].state.access = 'granted'
    state.scenes[sceneId].state.shared_by = grantingUserId
  },

  // TODO refactor?
  /**
   * @param {CompositorState}state
   * @param {{payload: {remoteSceneId: string}}}action
   */
  notifySceneAccessDenied: (state, action) => {
    const { sceneId } = action.payload
    state.scenes[sceneId].state.access = 'denied'
    state.scenes[sceneId].state.shared_by = null
  },

  // TODO refactor?
  /**
   * @param {CompositorState}state
   * @param {{payload: {sceneId: string, requestingUserId:string}}}action
   */
  grantSceneAccess: (state, action) => {
    const { sceneId, requestingUserId } = action.payload
    const scene = state.scenes[sceneId]
    scene.state.shared_with.push(requestingUserId)
  },

  // TODO refactor?
  /**
   * @param {CompositorState}state
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
   * @param {CompositorState}state
   * @param {Action}action
   */
  changeSceneName: (state, action) => {
    const { sceneId, name } = action.payload
    state.scenes[sceneId].name = name
  },

  // TODO refactor?
  /**
   * @param {CompositorState}state
   * @param {{payload: {sceneId: string, sharing: string}}}action
   */
  shareScene: (state, action) => {
    const { sceneId, sharing } = action.payload
    state.scenes[sceneId].state.sharing = sharing
  },

  // TODO refactor?
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
   * @param {{payload: {sceneId: string, lastActive: number}}}action
   */
  markSceneLastActive: (state, action) => {
    const { sceneId, lastActive } = action.payload
    Object.values(state.scenes).find(scene => scene.id === sceneId).lastActive = lastActive
  }
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/compositor'
})

export const {
  initializeCompositor,

  clientCreated,
  clientDestroyed,

  createUserSurface,
  updateUserSurface,
  userSurfaceDestroyed,

  updateUserSeat,

  updateUserConfiguration,
  createUserSurfaceView,
  destroyUserSurfaceView,

  createScene,
  markSceneLastActive,

  notifySceneAccessGrant,
  notifySceneAccessDenied,
  denySceneAccess,
  grantSceneAccess,
  changeSceneName,
  shareScene,
  destroyScene,

  setRemoteSceneScaling
} = slice.actions

export default slice.reducer
