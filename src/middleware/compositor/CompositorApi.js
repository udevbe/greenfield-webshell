import CompositorModule from './CompositorModule'
import { uuidv4 } from './index'

/**
 * @typedef {{id: string, clientId: string}}UserShellSurface
 */

class CompositorApi {
  /**
   * @return {CompositorApi}
   */
  static create () {
    const compositorModule = CompositorModule.create()
    return new CompositorApi(compositorModule)
  }

  /**
   * @param {Promise<{remoteAppLauncher: RemoteAppLauncher, webAppLauncher: WebAppLauncher, session: Session}>}compositorModule
   */
  constructor (compositorModule) {
    /**
     * @type {Promise<{remoteAppLauncher: RemoteAppLauncher, webAppLauncher: WebAppLauncher, session: Session}>}
     * @private
     */
    this._compositorModule = compositorModule

    /**
     * @type {RemoteAppLauncher}
     * @private
     */
    this._remoteAppLauncher = null
    /**
     * @type {WebAppLauncher}
     * @private
     */
    this._webAppLauncher = null

    /**
     * @type {Session}
     */
    this.session = null
    /**
     * @type {function(mouseEvent: MouseEvent, released: boolean, sceneId: string):Object}
     */
    this.createButtonEventFromMouseEvent = null
    /**
     * @type {function(wheelEvent: WheelEvent, sceneId: string):Object}
     */
    this.createAxisEventFromWheelEvent = null
    /**
     * @type {function(keyboardEvent: KeyboardEvent, down: boolean):Object}
     */
    this.createKeyEventFromKeyboardEvent = null
  }

  /**
   * @param {UserShellSurface}userShellSurface
   * @return {string}
   * @private
   */
  _userShellSurfaceKey (userShellSurface) {
    return `${userShellSurface.id}@${userShellSurface.clientId}`
  }

  /**
   * @param {string}userShellSurfaceKey
   * @return {{id: string, clientId: string}}
   * @private
   */
  _userShellSurface (userShellSurfaceKey) {
    const [id, clientId] = userShellSurfaceKey.split('@')
    return { id, clientId }
  }

  /**
   * @param {string}variant
   * @param {string}message
   */
  onNotify ({ variant, message }) {}

  /**
   * @param {Client}client
   */
  onCreateApplicationClient ({ client }) {}

  /**
   * @param {string}clientId
   */
  onDestroyApplicationClient ({ clientId }) {}

  /**
   * @param {UserShellSurface}userShellSurface
   * @param {Object}userShellSurfaceState
   * @param {string}key
   */
  onCreateUserSurface ({ userShellSurface, userShellSurfaceState, key }) {}

  /**
   * @param {UserShellSurface}userShellSurface
   * @param {Object}userShellSurfaceState
   * @param {string}key
   */
  onUpdateUserSurface ({ userShellSurface, userShellSurfaceState, key }) {}

  /**
   * @param {string}userSurfaceKey
   */
  onDestroyUserSurface ({ userSurfaceKey }) {}

  /**
   * @param {string}keyboardFocus
   * @param {string}pointerGrab
   */
  onUpdateUserSeat ({ keyboardFocus, pointerGrab }) {}

  onSceneRefresh ({ sceneId }) {}

  _linkUserShellEvents () {
    const userShell = this.session.userShell
    /**
     * @param {string}variant
     * @param {string}message
     */
    userShell.events.notify = (variant, message) => this.onNotify({ variant, message })
    /**
     * @param {Client}client
     */
    userShell.events.createApplicationClient = client => this.onCreateApplicationClient({ client })
    /**
     * @param {Client}client
     */
    userShell.events.destroyApplicationClient = client => this.onDestroyApplicationClient({ clientId: client.id })
    /**
     * @param {UserShellSurface}userShellSurface
     * @param {Object}userShellSurfaceState
     */
    userShell.events.createUserSurface = (userShellSurface, userShellSurfaceState) => {
      this.onCreateUserSurface({
        userShellSurface, userShellSurfaceState, key: this._userShellSurfaceKey(userShellSurface)
      })
    }
    /**
     * @param {UserShellSurface}userShellSurface
     * @param {Object}userShellSurfaceState
     */
    userShell.events.updateUserSurface = (userShellSurface, userShellSurfaceState) => {
      this.onUpdateUserSurface({
        userShellSurface, userShellSurfaceState, key: this._userShellSurfaceKey(userShellSurface)
      })
    }
    /**
     * @param {UserShellSurface}userShellSurface
     */
    userShell.events.destroyUserSurface = userShellSurface => { this.onDestroyUserSurface({ userSurfaceKey: this._userShellSurfaceKey(userShellSurface) }) }
    userShell.events.updateUserSeat = userSeatState => {
      this.onUpdateUserSeat({
        keyboardFocus: this._userShellSurfaceKey(userSeatState.keyboardFocus),
        pointerGrab: this._userShellSurfaceKey(userSeatState.pointerGrab)
      })
    }

    userShell.events.sceneRefresh = sceneId => this.onSceneRefresh({ sceneId })
  }

  // TODO refactor?
  setUserConfiguration (userConfiguration) {
    this.session.userShell.actions.setUserConfiguration(userConfiguration)
  }

  keyboardNrmlvoEntries () {
    return this.session.globals.seat.keyboard.nrmlvoEntries
  }

  keyboardDefaultNrmlvo () {
    return this.session.globals.seat.keyboard.defaultNrmlvo
  }

  async initializeCompositor (eventConnector) {
    const {
      remoteAppLauncher,
      webAppLauncher,
      session,
      createButtonEventFromMouseEvent,
      createAxisEventFromWheelEvent,
      createKeyEventFromKeyboardEvent
    } = await this._compositorModule

    this._remoteAppLauncher = remoteAppLauncher
    this._webAppLauncher = webAppLauncher
    this.session = session

    this.createButtonEventFromMouseEvent = createButtonEventFromMouseEvent
    this.createAxisEventFromWheelEvent = createAxisEventFromWheelEvent
    this.createKeyEventFromKeyboardEvent = createKeyEventFromKeyboardEvent

    this._linkUserShellEvents(eventConnector)

    // TODO move to compositor saga
    // this._restoreUserConfiguration(store)

    this.session.globals.register()
  }

  /**
   * @param {UserSurface}userSurface
   */
  requestUserSurfaceActive (userSurface) {
    this.session.userShell.actions.requestActive(userSurface)
  }

  /**
   * @param {UserSurface}userSurface
   * @param {string}sceneId
   */
  raiseUserSurface (userSurface, sceneId) {
    this.session.userShell.actions.raise(userSurface, sceneId)
  }

  /**
   * @param {string}sceneId
   */
  refreshScene (sceneId) {
    this.session.userShell.actions.refreshScene(sceneId)
  }

  /**
   * @param {string}userSurfaceKey
   */
  notifyUserSurfaceInactiveAction (userSurfaceKey) {
    const userShellSurface = this._userShellSurface(userSurfaceKey)
    this.session.userShell.actions.notifyInactive(userShellSurface)
  }

  /**
   * @param {string}userSurfaceKey
   */
  userSurfaceKeyboardFocus (userSurfaceKey) {
    const userShellSurface = this._userShellSurface(userSurfaceKey)
    this.session.userShell.actions.setKeyboardFocus(userShellSurface)
  }

  /**
   * @param {string}type
   * @return {string}
   */
  createScene (type) {
    if (type === 'local') {
      const id = uuidv4()

      const sceneElement = document.createElement('canvas')
      this.session.userShell.actions.initScene(id, sceneElement)

      sceneElement.onpointermove = event => {
        event.preventDefault()
        this.session.userShell.actions.input.pointerMove(this.createButtonEventFromMouseEvent(event, null, id))
      }
      sceneElement.onpointerdown = event => {
        event.preventDefault()
        sceneElement.setPointerCapture(event.pointerId)
        this.session.userShell.actions.input.buttonDown(this.createButtonEventFromMouseEvent(event, false, id))
      }
      sceneElement.onpointerup = event => {
        event.preventDefault()
        this.session.userShell.actions.input.buttonUp(this.createButtonEventFromMouseEvent(event, true, id))
        sceneElement.releasePointerCapture(event.pointerId)
      }
      sceneElement.onwheel = event => {
        event.preventDefault()
        this.session.userShell.actions.input.axis(this.createAxisEventFromWheelEvent(event, id))
      }
      sceneElement.onkeydown = event => {
        event.preventDefault()
        this.session.userShell.actions.input.key(this.createKeyEventFromKeyboardEvent(event, true))
      }
      sceneElement.onkeyup = event => {
        event.preventDefault()
        this.session.userShell.actions.input.key(event, false)
      }

      sceneElement.onmouseover = () => sceneElement.focus()
      sceneElement.tabIndex = 1

      sceneElement.style.display = 'none'
      sceneElement.id = id
      document.body.appendChild(sceneElement)
      return id
    }
  }

  /**
   * @param {string}sceneId
   */
  destroyScene (sceneId) {
    const sceneElement = document.getElementById(sceneId)
    sceneElement.parentElement.removeChild(sceneElement)
    this.session.userShell.actions.destroyScene(sceneId)
  }

  /**
   * @param {string}userSurfaceKey
   * @param {string}sceneId
   */
  createUserSurfaceView ({ userSurfaceKey, sceneId }) {
    const userShellSurface = this._userShellSurface(userSurfaceKey)
    this.session.userShell.actions.createView(userShellSurface, sceneId)
  }

  /**
   * @param {string}clientId
   */
  terminateClient (clientId) {
    this.session.userShell.actions.closeClient({ id: clientId })
  }

  /**
   * @param {string} appId
   * @param {string} url
   * @param {string} title
   * @return {Promise<void>}
   */
  async launchRemoteApp (appId, url, title) {
    await this._remoteAppLauncher.launch(new URL(url), appId)
  }

  /**
   * @param {string}downloadURL
   * @return {Promise<void>}
   */
  async launchWebApp (downloadURL) {
    await this._webAppLauncher.launch(new URL(downloadURL))
  }
}

export default CompositorApi.create()
