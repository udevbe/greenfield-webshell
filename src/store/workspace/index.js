import { createSlice } from '@reduxjs/toolkit'
/**
 * @typedef {{name: string, id: string, type: 'local'}}SceneState
 */
/**
 * @typedef {{scenes: Object.<string, SceneState>, activeSceneId: string}}WorkspaceState
 */

/**
 * @typedef {{type:string,payload:*}}Action
 */

/**
 * @type {WorkspaceState}
 */
const initialState = {
  scenes: {},
  activeSceneId: null
}

const reducers = {
  /**
   * @param {WorkspaceState}state
   * @param {Action}action
   */
  createLocalWorkspace: (state, action) => {
    const { id, name } = action.payload
    state.scenes[id] = { name, id, type: 'local' }
    state.activeSceneId = id
  },

  /**
   * @param {WorkspaceState}state
   * @param {Action}action
   */
  destroyWorkspace: (state, action) => {
    const { id } = action.payload
    delete state.scenes[id]
    const sceneIds = Object.keys(state.scenes)
    state.activeSceneId = sceneIds.length ? sceneIds[0] : null
  }
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/workspace'
})

export const {
  createLocalWorkspace,
  destroyWorkspace
} = slice.actions
export default slice.reducer
