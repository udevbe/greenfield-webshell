import * as types from './types'

export function saveInstallProposalEvent (proposalEvent) {
  return {
    type: types.ON_SAVE_INSTALL_PROPOSAL_EVENT,
    proposalEvent
  }
}

export function promptToAddToHomeScreen () {
  return {
    type: types.ON_PROMPT_TO_ADD_TO_HOME_SCREEN
  }
}
