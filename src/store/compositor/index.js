import { createAction, createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{id:number, clientId: string, title:string, appId:string, mapped:boolean, active: boolean, unresponsive: boolean, minimized: boolean, key: string, lastActive: number}}UserSurface
 */
/**
 * @typedef {{userSurfaceKey:string, sceneId: string}}UserSurfaceView
 */
/**
 * @typedef {{name: string, id: string, type: 'local', lastActive: number, views: UserSurfaceView[]}}Scene
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
 * seat: UserSeat,
 * userSurfaces: Object.<string,UserSurface>,
 * userConfiguration: UserConfiguration,
 * scenes: Object.<string, Scene>,
 * activeSceneId: ?string
 * }}CompositorState
 */
/**
 * @type {CompositorState}
 */
const initialState = {
  clients: {},
  initialized: false,
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
    state.scenes[sceneId].views.push({ userSurfaceKey, sceneId })
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  destroyUserSurfaceView: (state, action) => {
    const { userSurfaceKey, sceneId } = action.payload
    state.scenes[sceneId].views =
      state.scenes[sceneId].views.filter(view => view.userSurfaceKey !== userSurfaceKey && view.sceneId !== sceneId)
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  createScene: (state, action) => {
    const { name, id, type } = action.payload
    state.scenes[id] = { name, id, type, views: [] }
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  destroyScene: (state, action) => {
    const id = action.payload
    delete state.scenes[id]
  },

  updateScene: (state, action) => {
    const scene = action.payload
    state.scenes[scene.id] = scene
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
 * @type {function(payload: string):string}
 */
export const requestUserSurfaceActive = createAction('requestUserSurfaceActive')

/**
 * @type {function(payload: string):string}
 */
export const refreshScene = createAction('refreshScene')

/**
 * @type {function(payload: string):string}
 */
export const notifyUserSurfaceInactive = createAction('notifyUserSurfaceInactive')

/**
 * @type {function(payload: string):string}
 */
export const userSurfaceKeyboardFocus = createAction('userSurfaceKeyboardFocus')

/**
 * @type {function(payload: string):string}
 */
export const terminateClient = createAction('terminateClient')

/**
 * @type {function(payload: {url: string, type: 'web'|'remote'}):string}
 */
export const launchApp = createAction('launchApp')

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
  updateScene,
  destroyScene,
  markSceneLastActive
} = slice.actions

export default slice.reducer
