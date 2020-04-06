import CompositorModule from './CompositorModule'

/**
 * @return {string}
 */
function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

/**
 * @typedef {{variant: 'web'|'remote', id: string}}CompositorClient
 */

/**
 * @typedef {{id: string, clientId: string}}CompositorSurface
 */

/**
 * @typedef {{title:string, appId:string, mapped:boolean, active: boolean, unresponsive: boolean, minimized: boolean, key: string, lastActive: number, type: 'remote'|'local'}}CompositorSurfaceState
 */

/**
 * @typedef {string}UserShellSurfaceKey
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
   * @param {CompositorSurface}compositorSurface
   * @return {UserShellSurfaceKey}
   * @private
   */
  _userShellSurfaceKey (compositorSurface) {
    return `${compositorSurface.id}@${compositorSurface.clientId}`
  }

  /**
   * @param {UserShellSurfaceKey}surfaceKey
   * @return {CompositorSurface}
   * @private
   */
  _compositorSurface (surfaceKey) {
    const [id, clientId] = surfaceKey.split('@')
    return { id, clientId }
  }

  /**
   * @param {string}variant
   * @param {string}message
   */
  onNotify ({ variant, message }) {}

  /**
   * @param {UserShellClient}client
   */
  onCreateUserShellClient ({ client }) {}

  /**
   * @param {string}id
   */
  onDeleteUserShellClient ({ id }) {}

  /**
   * @param {UserShellSurface}surface
   */
  onCreateUserShellSurface ({ surface }) {}

  /**
   * @param {UserShellSurface}surface
   */
  onUpdateUserShellSurface ({ surface }) {}

  /**
   * @param {UserShellSurfaceKey}key
   */
  onDeleteUserShellSurface ({ key }) {}

  /**
   * @param {{pointerGrab: UserShellSurfaceKey, keyboardFocus: UserShellSurfaceKey}}seat
   */
  onUpdateUserShellSeat ({ seat }) {}

  /**
   * @param {string}id
   */
  onUserShellSceneRefresh ({ id }) {}

  /**
   * @private
   */
  _linkUserShellEvents () {
    const userShell = this.session.userShell
    /**
     * @param {string}variant
     * @param {string}message
     */
    userShell.events.notify = (variant, message) => this.onNotify({ variant, message })
    /**
     * @param {CompositorClient}client
     */
    userShell.events.createApplicationClient = client => this.onCreateUserShellClient({ client })
    /**
     * @param {CompositorClient}client
     */
    userShell.events.destroyApplicationClient = client => this.onDeleteUserShellClient({ id: client.id })
    /**
     * @param {CompositorSurface}compositorSurface
     * @param {Object}compositorSurfaceState
     */
    userShell.events.createUserSurface = (compositorSurface, compositorSurfaceState) => {
      const surface = {
        ...compositorSurface,
        ...compositorSurfaceState,
        key: this._userShellSurfaceKey(compositorSurface)
      }
      this.onCreateUserShellSurface({ surface })
    }
    /**
     * @param {CompositorSurface}compositorSurface
     * @param {Object}compositorSurfaceState
     */
    userShell.events.updateUserSurface = (compositorSurface, compositorSurfaceState) => {
      const surface = {
        ...compositorSurface,
        ...compositorSurfaceState,
        key: this._userShellSurfaceKey(compositorSurface)
      }
      this.onUpdateUserShellSurface({ surface })
    }
    /**
     * @param {CompositorSurface}compositorSurface
     */
    userShell.events.destroyUserSurface = compositorSurface => { this.onDeleteUserShellSurface({ key: this._userShellSurfaceKey(compositorSurface) }) }
    userShell.events.updateUserSeat = ({ keyboardFocus, pointerGrab }) => {
      const seat = {
        keyboardFocus: keyboardFocus ? this._userShellSurfaceKey(keyboardFocus) : null,
        pointerGrab: pointerGrab ? this._userShellSurfaceKey(pointerGrab) : null
      }
      this.onUpdateUserShellSeat({ seat })
    }
    userShell.events.sceneRefresh = sceneId => this.onUserShellSceneRefresh({ id: sceneId })
  }

  /**
   * @param {UserShellConfiguration}userShellConfiguration
   */
  updateCompositorConfiguration (userShellConfiguration) {
    this.session.userShell.actions.setUserConfiguration(userShellConfiguration)
  }

  /**
   * @return {Array<{name: string, rules: string, model: string, layout: string, variant: string, options: string}>}
   */
  compositorKeyboardNrmlvoEntries () {
    return this.session.globals.seat.keyboard.nrmlvoEntries
  }

  /**
   * @return {{name: string, rules: string, model: string, layout: string, variant: string, options: string}}
   */
  compositorKeyboardDefaultNrmlvo () {
    return this.session.globals.seat.keyboard.defaultNrmlvo
  }

  async createCompositor () {
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

    this._linkUserShellEvents()

    this.session.globals.register()
  }

  /**
   * @param {UserShellSurfaceKey}surfaceKey
   */
  requestCompositorSurfaceActive (surfaceKey) {
    const compositorSurface = this._compositorSurface(surfaceKey)
    this.session.userShell.actions.requestActive(compositorSurface)
  }

  /**
   * @param {UserShellSurfaceView}view
   */
  raiseCompositorSurfaceView (view) {
    const userShellSurfaceKey = view.surfaceKey
    const compositorSurface = this._compositorSurface(userShellSurfaceKey)
    this.session.userShell.actions.raise(compositorSurface, view.sceneId)
  }

  /**
   * @param {string}id
   * @return {Promise<void>}
   */
  refreshCompositorScene (id) {
    return this.session.userShell.actions.refreshScene(id)
  }

  /**
   * @param {UserShellSurfaceKey}surfaceKey
   */
  notifyCompositorSurfaceInactive (surfaceKey) {
    const compositorSurface = this._compositorSurface(surfaceKey)
    this.session.userShell.actions.notifyInactive(compositorSurface)
  }

  /**
   * @param {UserShellSurfaceKey}surfaceKey
   */
  updateCompositorKeyboardFocus (surfaceKey) {
    const compositorSurface = this._compositorSurface(surfaceKey)
    this.session.userShell.actions.setKeyboardFocus(compositorSurface)
  }

  /**
   * @param {string}type
   * @return {string}
   */
  createCompositorScene (type) {
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
   * @param {string}id
   */
  deleteCompositorScene (id) {
    const sceneElement = document.getElementById(id)
    sceneElement.parentElement.removeChild(sceneElement)
    this.session.userShell.actions.destroyScene(id)
  }

  /**
   * @param {UserShellSurfaceView}view
   */
  createCompositorSurfaceView (view) {
    const userShellSurfaceKey = view.surfaceKey
    const compositorSurface = this._compositorSurface(userShellSurfaceKey)
    this.session.userShell.actions.createView(compositorSurface, view.sceneId)
  }

  /**
   * @param {string}id
   */
  deleteCompositorClient (id) {
    this.session.userShell.actions.closeClient({ id })
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

const compositorApi = CompositorApi.create()
export default compositorApi

/**
 * @param {string}downloadURL
 * @return {Promise<void>}
 */
export const launchWebApp = downloadURL => compositorApi.launchWebApp(downloadURL)
/**
 * @param {string}appId
 * @param {string}url
 * @param {string}title
 * @return {Promise<void>}
 */
export const launchRemoteApp = (appId, url, title) => compositorApi.launchRemoteApp(appId, url, title)
/**
 * @param {string}id
 */
export const deleteCompositorClient = id => compositorApi.deleteCompositorClient(id)
/**
 * @param {UserShellSurfaceView}view
 */
export const createCompositorSurfaceView = view => compositorApi.createCompositorSurfaceView(view)
/**
 * @param {UserShellSurfaceView}view
 */
export const raiseCompositorSurfaceView = view => compositorApi.raiseCompositorSurfaceView(view)
/**
 * @param {'local'}type
 * @return {string}
 */
export const createCompositorScene = type => compositorApi.createCompositorScene(type)
/**
 * @param {string}id
 */
export const deleteCompositorScene = id => compositorApi.deleteCompositorScene(id)
/**
 * @param {string}id
 * @return {Promise<void>}
 */
export const refreshCompositorScene = id => compositorApi.refreshCompositorScene(id)
/**
 * @param {UserShellSurfaceKey}surfaceKey
 */
export const updateCompositorKeyboardFocus = surfaceKey => compositorApi.updateCompositorKeyboardFocus(surfaceKey)
/**
 * @param {UserShellSurfaceKey}surfaceKey
 */
export const requestCompositorSurfaceActive = surfaceKey => compositorApi.requestCompositorSurfaceActive(surfaceKey)
/**
 * @param {UserShellSurfaceKey}surfaceKey
 */
export const notifyCompositorSurfaceInactive = surfaceKey => compositorApi.notifyCompositorSurfaceInactive(surfaceKey)
/**
 * @return {Promise<void>}
 */
export const createCompositor = () => compositorApi.createCompositor()
/**
 * @return {{name: string, rules: string, model: string, layout: string, variant: string, options: string}}
 */
export const compositorKeyboardDefaultNrmlvo = () => compositorApi.compositorKeyboardDefaultNrmlvo()
/**
 * @return {Array<{name: string, rules: string, model: string, layout: string, variant: string, options: string}>}
 */
export const compositorKeyboardNrmlvoEntries = () => compositorApi.compositorKeyboardNrmlvoEntries()
/**
 * @param {UserShellConfiguration}configuration
 */
export const updateCompositorConfiguration = configuration => compositorApi.updateCompositorConfiguration(configuration)
