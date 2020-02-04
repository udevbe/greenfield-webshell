import { createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {{type:string,payload:*}}Action
 */

/**
 * @typedef {{proposalEvent:BeforeInstallPromptEvent}}AddToHomeScreenState
 */
const initialState = { proposalEvent: null }

const reducers = {
  /**
   * @param {AddToHomeScreenState}state
   * @param {Action}action
   */
  saveInstallProposalEvent: (state, action) => {
    state.proposalEvent = action.payload
  },
  /**
   * @param {AddToHomeScreenState}state
   */
  onPromptToAddToHomeScreen: state => { state.proposalEvent = null }
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/addToHomeScreen'
})

export const { saveInstallProposalEvent, onPromptToAddToHomeScreen } = slice.actions
export default slice.reducer
