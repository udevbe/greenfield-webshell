import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AddToHomeScreenState {
  proposalEvent?: Event
}
const initialState: AddToHomeScreenState = {}

const reducers = {
  saveInstallProposalEvent: (
    state: AddToHomeScreenState,
    action: PayloadAction<Event>
  ) => {
    state.proposalEvent = action.payload
  },

  onPromptToAddToHomeScreen: (state: AddToHomeScreenState) => {
    state.proposalEvent = undefined
  },
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/addToHomeScreen',
})

export const {
  saveInstallProposalEvent,
  onPromptToAddToHomeScreen,
} = slice.actions
export default slice.reducer
