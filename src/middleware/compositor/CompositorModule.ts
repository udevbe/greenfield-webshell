import type {
  CompositorRemoteAppLauncher,
  CompositorSession,
  CompositorWebAppLauncher,
  CreateAxisEventFromWheelEvent,
  CreateButtonEventFromMouseEvent,
  CreateKeyEventFromKeyboardEvent,
} from 'greenfield-compositor'

const importCompositorModule = import('greenfield-compositor')

export interface CompositorModule {
  remoteAppLauncher: CompositorRemoteAppLauncher
  webAppLauncher: CompositorWebAppLauncher
  session: CompositorSession
  createButtonEventFromMouseEvent: CreateButtonEventFromMouseEvent
  createAxisEventFromWheelEvent: CreateAxisEventFromWheelEvent
  createKeyEventFromKeyboardEvent: CreateKeyEventFromKeyboardEvent
}

export default async function (): Promise<CompositorModule> {
  const {
    initWasm,
    createCompositorRemoteAppLauncher,
    createCompositorRemoteSocket,
    createCompositorSession,
    createCompositorWebAppLauncher,
    createCompositorWebAppSocket,
    createButtonEventFromMouseEvent,
    createAxisEventFromWheelEvent,
    createKeyEventFromKeyboardEvent,
  } = await importCompositorModule

  await initWasm()

  const session = createCompositorSession()

  const webAppSocket = createCompositorWebAppSocket(session)
  const webAppLauncher = createCompositorWebAppLauncher(webAppSocket)

  const remoteSocket = createCompositorRemoteSocket(session)
  const remoteAppLauncher = createCompositorRemoteAppLauncher(session, remoteSocket)

  return {
    session,
    webAppLauncher,
    remoteAppLauncher,
    createButtonEventFromMouseEvent,
    createAxisEventFromWheelEvent,
    createKeyEventFromKeyboardEvent,
  }
}
