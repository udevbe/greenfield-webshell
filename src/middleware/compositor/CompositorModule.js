const importCompositorModule = import('compositor-module')

class CompositorModule {
  /**
   * @return {Promise<{remoteAppLauncher: RemoteAppLauncher, webAppLauncher: WebAppLauncher, session: Session}>}
   */
  static async create () {
    const {
      initWasm,
      RemoteAppLauncher,
      RemoteSocket,
      Session,
      WebAppLauncher,
      WebAppSocket
    } = await importCompositorModule

    await initWasm()

    const session = Session.create()

    const webAppSocket = WebAppSocket.create(session)
    const webAppLauncher = WebAppLauncher.create(webAppSocket)

    const remoteSocket = RemoteSocket.create(session)
    const remoteAppLauncher = RemoteAppLauncher.create(session, remoteSocket)

    return { session, webAppLauncher, remoteAppLauncher }
  }
}

export default CompositorModule
