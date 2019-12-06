import * as types from './types'

export default function addToHomeScreen (state = {}, action) {
  switch (action.type) {
    case types.ON_SAVE_INSTALL_PROPOSAL_EVENT:
      return { ...state, proposalEvent: action.proposalEvent }
    case types.ON_PROMPT_TO_ADD_TO_HOME_SCREEN:
      return { ...state, proposalEvent: undefined }
    default:
      return state
  }
}
