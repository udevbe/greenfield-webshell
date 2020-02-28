import { createAction, createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{id:number, clientId: string, title:string, appId:string, mapped:boolean, active: boolean, unresponsive: boolean, minimized: boolean, key: string, lastActive: number}}UserSurface
 */
/**
 * @typedef {{userSurfaceKey:string, sceneId: string}}UserSurfaceView
 */
/**
 * @typedef {{name: string, id: string, type: 'local', views: UserSurfaceView[]}}Scene
 */
/**
 * @typedef {{id:number, variant: 'web'|'remote'}}WaylandClient
 */
/**
 * @typedef {{pointerGrab: ?string, keyboardFocus: ?string}}UserSeat
 */
/**
 * @typedef {{scrollFactor:number, keyboardLayout: ?string}}UserConfiguration
 */
/**
 * @typedef {{
 * clients: Object.<string,WaylandClient>,
 * initialized: boolean,
 * initializing: boolean,
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
  initializing: false,
  seat: {
    pointerGrab: null,
    keyboardFocus: null
  },
  userSurfaces: {},
  userConfiguration: {
    scrollFactor: 1,
    keyboardLayoutName: null
  },
  scenes: {},
  activeSceneId: null
}

/**
 * @typedef {{type:string,payload:*}}Action
 */
const reducers = {
  /**
   * @param {CompositorState}state
   */
  compositorInitializing: (state) => { state.initializing = true },

  /**
   * @param {CompositorState}state
   */
  compositorInitialized: (state) => {
    state.initializing = false
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
    const userSurface = action.payload
    delete state.userSurfaces[userSurface.key]
  },

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  updateUserSeat: (state, action) => {
    const { keyboardFocus, pointerGrab } = action.payload
    state.seat = { pointerGrab, keyboardFocus }
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

  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  makeSceneActive: (state, action) => {
    const id = action.payload
    state.activeSceneId = id
  }
}

// actions handled by compositor middleware
/**
 * @type {function(payload: UserSurfaceView):string}
 */
export const raiseUserSurfaceView = createAction('raiseUserSurfaceView')

/**
 * @type {function(payload: UserSurface):string}
 */
export const requestUserSurfaceActive = createAction('requestUserSurfaceActive')

/**
 * @type {function(payload: {event: MouseEvent, sceneId: string}):string}
 */
export const inputPointerMove = createAction('pointerMove')

/**
 * @type {function(payload: {event: MouseEvent, sceneId: string}):string}
 */
export const inputButtonDown = createAction('buttonDown')

/**
 * @type {function(payload: {event: MouseEvent, sceneId: string}):string}
 */
export const inputButtonUp = createAction('buttonUp')

/**
 * @type {function(payload: {event: WheelEvent, sceneId: string}):string}
 */
export const inputAxis = createAction('axis')

/**
 * @type {function(payload: {event: KeyEvent, down: boolean}):string}
 */
export const inputKey = createAction('key')

/**
 * @type {function(payload: string):string}
 */
export const refreshScene = createAction('refreshScene')

/**
 * @type {function(payload: UserSurface):string}
 */
export const notifyUserSurfaceInactive = createAction('notifyUserSurfaceInactive')

/**
 * @type {function(payload: UserSurface):string}
 */
export const userSurfaceKeyboardFocus = createAction('userSurfaceKeyboardFocus')

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/compositor'
})

export const {
  compositorInitializing,
  compositorInitialized,

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
  destroyScene,
  makeSceneActive
} = slice.actions
export default slice.reducer
