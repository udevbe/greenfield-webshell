import type { RouterState } from 'connected-react-router'
import type { DefaultRootState } from 'react-redux'
import type { AddToHomeScreenState } from '../store/addToHomeScreen'
import type { UserShellCompositorState } from '../store/compositor'
import type { DialogsState } from '../store/dialogs'
import type { DrawerState } from '../store/drawer'
import type { LocaleState } from '../store/locale'
import type { NotificationState } from '../store/notification'
import type { ServiceWorkerState } from '../store/serviceworker'
import type { SimpleValueState } from '../store/simpleValues'
import type { ThemeSourceState } from '../store/themeSource'
import type { FirebaseState } from './FirebaseDataBaseSchema'

declare module 'react-redux' {
  export interface DefaultRootState {
    compositor: UserShellCompositorState
    firebase: FirebaseState
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
    simpleValues: SimpleValueState
  }
}
