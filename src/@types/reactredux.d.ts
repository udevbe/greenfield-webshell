import type { DefaultRootState } from 'react-redux'

declare module 'react-redux' {
  import type { RouterState } from 'connected-react-router'
  import { FirebaseReducer } from 'react-redux-firebase'
  import type { AddToHomeScreenState } from '../store/addToHomeScreen'
  import type { UserShellCompositorState } from '../store/compositor'
  import type { DialogsState } from '../store/dialogs'
  import type { DrawerState } from '../store/drawer'

  export interface DefaultRootState {
    compositor: UserShellCompositorState
    // TODO add ProfileType & Schema generics
    firebase: FirebaseReducer.Reducer
    drawer: DrawerState
    dialogs: DialogsState
    addToHomeScreen: AddToHomeScreenState
    router: RouterState<{
      fromRedirect: boolean
      fromLocation: string
    }>
  }
}
