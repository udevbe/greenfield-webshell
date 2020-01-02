import { createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{drawerPath: Array<string>, useMinified: boolean, open: boolean, mobileOpen: boolean}}DrawerState
 */
/**
 *
 * @type {DrawerState}
 */
const initialState = {
  mobileOpen: false,
  open: false,
  useMinified: false,
  drawerPath: []
}

/**
 * @typedef {{type:string,payload:*}}Action
 */
const reducers = {
  /**
   * @param {DrawerState}state
   * @param {Action}action
   */
  setDrawerOpen: (state, action) => {
    state.open = action.payload
    if (state.open) {
      state.useMinified = false
    }
  },
  /**
   * @param {DrawerState}state
   * @param {Action}action
   */
  setDrawerMobileOpen: (state, action) => { state.mobileOpen = action.payload },
  /**
   * @param {DrawerState}state
   * @param {Action}action
   */
  setDrawerUseMinified: (state, action) => {
    state.useMinified = action.payload
    state.open = false
  },
  /**
   * @param {DrawerState}state
   * @param {Action}action
   */
  pushDrawerPath: (state, action) => { state.drawerPath.push(action.payload) },
  /**
   * @param {DrawerState}state
   * @param {Action}action
   */
  popDrawerPath: state => { state.drawerPath.pop() },
  /**
   * @param {DrawerState}state
   * @param {Action}action
   */
  setDrawerPath: (state, action) => { state.drawerPath = action.payload}
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/drawer'
})

export const {
  setDrawerMobileOpen,
  setDrawerOpen,
  pushDrawerPath,
  popDrawerPath,
  setDrawerPath,
  setDrawerUseMinified
} = slice.actions
export default slice.reducer
