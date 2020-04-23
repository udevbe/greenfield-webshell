import type { DefaultRootState } from 'react-redux'

declare module 'react-redux' {
  import { FirebaseReducer } from 'react-redux-firebase'
  import type { UserShellCompositorState } from '../store/compositor'
  import type { DrawerState } from '../store/drawer'

  export interface DefaultRootState {
    compositor: UserShellCompositorState
    // TODO add ProfileType & Schema generics
    firebase: FirebaseReducer.Reducer
    drawer: DrawerState
  }
}
