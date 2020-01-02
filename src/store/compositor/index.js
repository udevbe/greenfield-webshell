import { createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{id:number, clientId: string, title:string, appId:string, mapped:boolean, active: boolean, unresponsive: boolean, minimized: boolean, key: string}}UserSurface
 */
/**
 * @typedef {{id:number, variant: 'web'|'remote'}}WaylandClient
 */
/**
 * @typedef {{pointerGrab: ?UserSurface, keyboardFocus: ?UserSurface}}UserSeat
 */
/**
 * @typedef {{clients: Object.<string,WaylandClient>, initialized: boolean, initializing: boolean, seat: UserSeat, userSurfaces: Object.<string,UserSurface>}}CompositorState
 */
/**
 * @type {CompositorState}
 */
const initialState = {
  clients: {},
  initialized: false,
  initializing: false,
  seat: { pointerGrab: null, keyboardFocus: null },
  userSurfaces: {}
}

/**
 * @param {UserSurface}userSurface
 * @return {UserSurface}
 */
function withUserSurfaceKey (userSurface) {
  return userSurface ? { ...userSurface, key: `${userSurface.id}@${userSurface.clientId}` } : null
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
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  createUserSurface: (state, action) => {
    const userSurface = withUserSurfaceKey(action.payload)
    state.userSurfaces[userSurface.key] = userSurface
  },
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  updateUserSurface: (state, action) => {
    const userSurface = withUserSurfaceKey(action.payload)
    state.userSurfaces[userSurface.key] = userSurface
  },
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  destroyUserSurface: (state, action) => {
    const userSurface = withUserSurfaceKey(action.payload)
    delete state.userSurfaces[userSurface.key]
  },
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  updateUserSeat: (state, action) => {
    const { keyboardFocus, pointerGrab } = action.payload
    state.seat = { pointerGrab: withUserSurfaceKey(pointerGrab), keyboardFocus: withUserSurfaceKey(keyboardFocus) }
  }
}

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
  updateUserSeat
} = slice.actions
export default slice.reducer
