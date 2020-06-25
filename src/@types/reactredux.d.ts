import type { DefaultRootState } from 'react-redux'

declare module 'react-redux' {
  import type { RouterState } from 'connected-react-router'
  import type { FirebaseReducer } from 'react-redux-firebase'
  import type { AddToHomeScreenState } from '../store/addToHomeScreen'
  import type { UserShellCompositorState } from '../store/compositor'
  import type { DialogsState } from '../store/dialogs'
  import type { DrawerState } from '../store/drawer'
  import type { LocaleState } from '../store/locale'
  import type { ThemeSourceState } from '../store/themeSource'
  import type { NotificationState } from '../store/notification'
  import type { ServiceWorkerState } from '../store/serviceworker'

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
    themeSource: ThemeSourceState
    locale: LocaleState
    notification: NotificationState
    serviceWorker: ServiceWorkerState
  }
}
