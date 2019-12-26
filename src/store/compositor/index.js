import { createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{title:string, appId:string, mapped:boolean, active: boolean, unresponsive: boolean, minimized: boolean}}UserSurfaceState
 */
/**
 * @typedef {{id:number, clientId: string, userSurfaceState: UserSurfaceState}}UserSurface
 */
/**
 * @typedef {{id:number, userSurfaces: Object.<number,UserSurface>}}WaylandClient
 */
/**
 * @typedef {{clients: Object.<string,WaylandClient>, initialized: boolean, initializing: boolean}}CompositorState
 */
/**
 * @type {CompositorState}
 */
const initialState = { clients: {}, initialized: false, initializing: false }
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
    state.clients[client.id] = {
      id: client.id,
      userSurfaces: {}
    }
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
    const { id, clientId, userSurfaceState } = action.payload
    state.clients[clientId].userSurfaces[id] = { id, clientId, userSurfaceState }
  },
  updateUserSurface: (state, action) => {
    const { id, clientId, userSurfaceState } = action.payload
    state.clients[clientId].userSurfaces[id].userSurfaceState = userSurfaceState
  },
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  destroyUserSurface: (state, action) => {
    const { id, clientId } = action.payload
    delete state.clients[clientId].userSurfaces[id]
  }
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/compositor'
})

export const { compositorInitializing, compositorInitialized, createClient, destroyClient, createUserSurface, updateUserSurface, destroyUserSurface } = slice.actions
export default slice.reducer
