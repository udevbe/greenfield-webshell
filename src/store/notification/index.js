import { createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{type:string,payload:*}}Action
 */

/**
 * @typedef {{message:string,variant:'info'|'warn'|'error'|'success'}}Notification
 */

/**
 * @typedef {{notification:?Notification}}ServiceWorkerState
 */

/**
 * @type {ServiceWorkerState}
 */
const initialState = { notification: null }

const reducers = {
  /**
   * @param {ServiceWorkerState}state
   * @param {Action}action
   */
  showNotification: (state, action) => { state.notification = action.payload },
  hideNotification: (state) => { state.notification = null }
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/notification'
})

export const { showNotification, hideNotification } = slice.actions
export default slice.reducer
