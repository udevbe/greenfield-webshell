import type {
  CreateAxisEventFromWheelEventFunc,
  CreateButtonEventFromMouseEventFunc,
  CreateKeyEventFromKeyboardEventFunc,
  RemoteAppLauncher,
  Session,
  WebAppLauncher,
} from 'greenfield-compositor'

const importCompositorModule = import('greenfield-compositor')

export interface CompositorModule {
  remoteAppLauncher: RemoteAppLauncher
  webAppLauncher: WebAppLauncher
  session: Session
  createButtonEventFromMouseEvent: CreateButtonEventFromMouseEventFunc
  createAxisEventFromWheelEvent: CreateAxisEventFromWheelEventFunc
  createKeyEventFromKeyboardEvent: CreateKeyEventFromKeyboardEventFunc
}

export default async function (): Promise<CompositorModule> {
  const {
    initWasm,
    RemoteAppLauncher,
    RemoteSocket,
    Session,
    WebAppLauncher,
    WebAppSocket,
    createButtonEventFromMouseEvent,
    createAxisEventFromWheelEvent,
    createKeyEventFromKeyboardEvent,
  } = await importCompositorModule

  await initWasm()

  const session = Session.create()

  const webAppSocket = WebAppSocket.create(session)
  const webAppLauncher = WebAppLauncher.create(webAppSocket)

  const remoteSocket = RemoteSocket.create(session)
  const remoteAppLauncher = RemoteAppLauncher.create(session, remoteSocket)

  return {
    session,
    webAppLauncher,
    remoteAppLauncher,
    createButtonEventFromMouseEvent,
    createAxisEventFromWheelEvent,
    createKeyEventFromKeyboardEvent,
  }
}
