import { createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{}}WaylandSurfaceView
 */
/**
 * @typedef {{id:number, views:Array<WaylandSurfaceView>}}WaylandSurface
 */
/**
 * @typedef {{id:number, surfaces: Array<WaylandSurface>}}WaylandClient
 */
/**
 * @typedef {{clients: Array<WaylandClient>}}CompositorState
 */
/**
 * @type {CompositorState}
 */
const initialState = { clients: [] }
/**
 * @typedef {{type:string,payload:*}}Action
 */

const reducers = {
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  onClientConnected: (state, action) => state.clients.push(action.payload.client),
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  onClientDisconnected: (state, action) => { state.clients = state.clients.filter(client => client.id !== action.payload.client.id) },
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  onSurfaceCreated: (state, action) => { state.clients.find(client => client.id === action.payload.client.id).surfaces.push(action.payload.surface) },
  /**
   * @param {CompositorState}state
   * @param {Action}action
   */
  onSurfaceDestroyed: (state, action) => {
    const client = state.clients.find(client => client.id === state.client.id)
    client.surfaces = client.surfaces.filter(surface => surface.id !== action.surface.id)
  }
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/compositor'
})

export const { onClientConnected, onClientDisconnected, onSurfaceCreated, onSurfaceDestroyed } = slice.actions
export default slice.reducer
