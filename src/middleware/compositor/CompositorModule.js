const importCompositorModule = import('compositor-module')

class CompositorModule {
  /**
   * @return {Promise<{
   * remoteAppLauncher: RemoteAppLauncher,
   * webAppLauncher: WebAppLauncher,
   * session: Session,
   * createButtonEventFromMouseEvent: function(mouseEvent: MouseEvent, released: boolean, sceneId: string):Object,
   * createAxisEventFromWheelEvent: function(wheelEvent: WheelEvent, sceneId: string):Object,
   * createKeyEventFromKeyboardEvent: function(keyboardEvent: KeyboardEvent, down: boolean):Object
   * }>}
   */
  static async create () {
    const {
      initWasm,
      RemoteAppLauncher,
      RemoteSocket,
      Session,
      WebAppLauncher,
      WebAppSocket,
      createButtonEventFromMouseEvent,
      createAxisEventFromWheelEvent,
      createKeyEventFromKeyboardEvent
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
      createKeyEventFromKeyboardEvent
    }
  }
}

export default CompositorModule
