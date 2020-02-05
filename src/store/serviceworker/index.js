import { createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{type:string,payload:*}}Action
 */
/**
 * @typedef {{registered:boolean, canUpdate: boolean, registration: ServiceWorkerRegistration, registrationUpdate: ServiceWorkerRegistration}}ServiceWorkerState
 */

/**
 * @type {ServiceWorkerState}
 */
const initialState = { registered: false, canUpdate: false, registration: null, registrationUpdate: null }

const reducers = {
  /**
   * @param {ServiceWorkerState}state
   * @param {Action}action
   */
  registrationSuccess: (state, action) => {
    state.registered = true
    state.registration = action.payload
  },
  /**
   * @param {ServiceWorkerState}state
   * @param {Action}action
   */
  updateAvailable: (state, action) => {
    state.canUpdate = true
    state.registrationUpdate = action.payload
  }
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/serviceworker'
})

export const { registrationSuccess, updateAvailable } = slice.actions
export default slice.reducer
