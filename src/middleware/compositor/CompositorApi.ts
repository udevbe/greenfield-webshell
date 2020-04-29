import type {
  ApplicationClient,
  AxisEvent,
  ButtonEvent,
  CompositorSurface,
  CompositorSurfaceState,
  CreateAxisEventFromWheelEventFunc,
  CreateButtonEventFromMouseEventFunc,
  CreateKeyEventFromKeyboardEventFunc,
  KeyEvent,
  nrmlvo,
  RemoteAppLauncher,
  Session,
  UserShellApi,
  WebAppLauncher,
} from 'greenfield-compositor'

import type {
  UserShellClient,
  UserShellConfiguration,
  UserShellScene,
  UserShellSeat,
  UserShellSurface,
  UserShellSurfaceView,
} from '../../store/compositor'
import type { CompositorModule } from './CompositorModule'
import CompositorModuleCreator from './CompositorModule'

export function uuidv4(): string {
  return '10000000-1000-4000-8000-100000000000'.replace(
    /[018]/g,
    (char: string) => {
      const c = parseInt(char)
      return (
        c ^
        (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    }
  )
}

export type UserShellSurfaceKey = string

export interface CompositorApiEventCallbacks {
  onNotify?: CompositorApiEventCallback<{ variant: string; message: string }>
  onCreateUserShellClient?: CompositorApiEventCallback<UserShellClient>
  onDeleteUserShellClient?: CompositorApiEventCallback<
    Pick<UserShellClient, 'id'>
  >
  onCreateUserShellSurface?: CompositorApiEventCallback<UserShellSurface>
  onUpdateUserShellSurface?: CompositorApiEventCallback<UserShellSurface>
  onDeleteUserShellSurface?: CompositorApiEventCallback<UserShellSurfaceKey>
  onUpdateUserShellSeat?: CompositorApiEventCallback<
    Pick<UserShellSeat, 'keyboardFocus' | 'pointerGrab'>
  >
  onUserShellSceneRefresh?: CompositorApiEventCallback<
    Pick<UserShellScene, 'id'>
  >
}

export interface CompositorApiEventCallback<E> {
  (event: E): void
}

export class CompositorApi {
  static create(): CompositorApi {
    const compositorModule = CompositorModuleCreator()
    return new CompositorApi(compositorModule)
  }

  static userShellSurfaceKey(
    compositorSurface: CompositorSurface
  ): UserShellSurfaceKey {
    return `${compositorSurface.id}@${compositorSurface.clientId}`
  }

  static compositorSurface(surfaceKey: UserShellSurfaceKey): CompositorSurface {
    const [id, clientId] = surfaceKey.split('@')
    return { id, clientId }
  }

  public session?: Session
  readonly #compositorModule: Promise<CompositorModule>
  #remoteAppLauncher: RemoteAppLauncher | null = null
  #webAppLauncher: WebAppLauncher | null = null
  createButtonEventFromMouseEvent: CreateButtonEventFromMouseEventFunc | null = null
  createAxisEventFromWheelEvent: CreateAxisEventFromWheelEventFunc | null = null
  createKeyEventFromKeyboardEvent: CreateKeyEventFromKeyboardEventFunc | null = null

  events: CompositorApiEventCallbacks = {}

  constructor(compositorModule: Promise<CompositorModule>) {
    this.#compositorModule = compositorModule
  }

  private linkUserShellEvents(userShell: UserShellApi): void {
    userShell.events.notify = (variant: string, message: string): void =>
      this.events.onNotify?.({ variant, message })

    userShell.events.createApplicationClient = (
      client: ApplicationClient
    ): void => this.events.onCreateUserShellClient?.(client)

    userShell.events.destroyApplicationClient = (
      client: ApplicationClient
    ): void => this.events.onDeleteUserShellClient?.({ id: client.id })

    userShell.events.createUserSurface = (
      compositorSurface: CompositorSurface,
      compositorSurfaceState: CompositorSurfaceState
    ): void => {
      const surface: UserShellSurface = {
        ...compositorSurface,
        ...compositorSurfaceState,
        key: CompositorApi.userShellSurfaceKey(compositorSurface),
      }
      this.events.onCreateUserShellSurface?.(surface)
    }

    userShell.events.updateUserSurface = (
      compositorSurface: CompositorSurface,
      compositorSurfaceState: CompositorSurfaceState
    ): void => {
      const surface: UserShellSurface = {
        ...compositorSurface,
        ...compositorSurfaceState,
        key: CompositorApi.userShellSurfaceKey(compositorSurface),
      }
      this.events.onUpdateUserShellSurface?.(surface)
    }

    userShell.events.destroyUserSurface = (
      compositorSurface: CompositorSurface
    ): void =>
      this.events.onDeleteUserShellSurface?.(
        CompositorApi.userShellSurfaceKey(compositorSurface)
      )

    userShell.events.updateUserSeat = ({
      keyboardFocus,
      pointerGrab,
    }): void => {
      const seat = {
        keyboardFocus: keyboardFocus
          ? CompositorApi.userShellSurfaceKey(keyboardFocus)
          : undefined,
        pointerGrab: pointerGrab
          ? CompositorApi.userShellSurfaceKey(pointerGrab)
          : undefined,
      }
      this.events.onUpdateUserShellSeat?.(seat)
    }
    userShell.events.sceneRefresh = (sceneId: string): void =>
      this.events.onUserShellSceneRefresh?.({ id: sceneId })
  }

  updateCompositorConfiguration(
    userShellConfiguration: Partial<UserShellConfiguration>
  ): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    this.session.userShell.actions.setUserConfiguration(userShellConfiguration)
  }

  compositorKeyboardNrmlvoEntries(): nrmlvo[] {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    return this.session.globals.seat.keyboard.nrmlvoEntries
  }

  compositorKeyboardDefaultNrmlvo(): nrmlvo {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    return this.session.globals.seat.keyboard.defaultNrmlvo
  }

  async createCompositor(): Promise<void> {
    const {
      remoteAppLauncher,
      webAppLauncher,
      session,
      createButtonEventFromMouseEvent,
      createAxisEventFromWheelEvent,
      createKeyEventFromKeyboardEvent,
    } = await this.#compositorModule

    this.#remoteAppLauncher = remoteAppLauncher
    this.#webAppLauncher = webAppLauncher
    this.session = session

    this.createButtonEventFromMouseEvent = createButtonEventFromMouseEvent
    this.createAxisEventFromWheelEvent = createAxisEventFromWheelEvent
    this.createKeyEventFromKeyboardEvent = createKeyEventFromKeyboardEvent

    this.linkUserShellEvents(session.userShell)

    session.globals.register()
  }

  requestCompositorSurfaceActive(surfaceKey: UserShellSurfaceKey): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    const compositorSurface: CompositorSurface = CompositorApi.compositorSurface(
      surfaceKey
    )
    this.session.userShell.actions.requestActive(compositorSurface)
  }

  raiseCompositorSurfaceView(view: UserShellSurfaceView): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    const userShellSurfaceKey = view.surfaceKey
    const compositorSurface = CompositorApi.compositorSurface(
      userShellSurfaceKey
    )
    this.session.userShell.actions.raise(compositorSurface, view.sceneId)
  }

  refreshCompositorScene(id: string): Promise<void> {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    return this.session.userShell.actions.refreshScene(id)
  }

  notifyCompositorSurfaceInactive(surfaceKey: UserShellSurfaceKey): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    const compositorSurface = CompositorApi.compositorSurface(surfaceKey)
    this.session.userShell.actions.notifyInactive(compositorSurface)
  }

  updateCompositorKeyboardFocus(surfaceKey: UserShellSurfaceKey): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    const compositorSurface = CompositorApi.compositorSurface(surfaceKey)
    this.session.userShell.actions.setKeyboardFocus(compositorSurface)
  }

  pointerMove(event: ButtonEvent): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    this.session.userShell.actions.input.pointerMove(event)
  }

  buttonDown(event: ButtonEvent): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    this.session.userShell.actions.input.buttonDown(event)
  }

  buttonUp(event: ButtonEvent): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    this.session.userShell.actions.input.buttonUp(event)
  }

  axis(event: AxisEvent): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    this.session.userShell.actions.input.axis(event)
  }

  key(event: KeyEvent): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    this.session.userShell.actions.input.key(event)
  }

  createCompositorScene(): string {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }
    const id = uuidv4()

    const sceneElement = document.createElement('canvas')
    this.session.userShell.actions.initScene(id, sceneElement)

    sceneElement.onpointermove = (event: PointerEvent): void => {
      if (!this.createButtonEventFromMouseEvent) {
        throw new Error('Compositor not initialized.')
      }

      event.preventDefault()
      this.pointerMove(this.createButtonEventFromMouseEvent(event, null, id))
    }
    sceneElement.onpointerdown = (event: PointerEvent): void => {
      if (!this.createButtonEventFromMouseEvent) {
        throw new Error('Compositor not initialized.')
      }

      event.preventDefault()
      sceneElement.setPointerCapture(event.pointerId)
      this.buttonDown(this.createButtonEventFromMouseEvent(event, false, id))
    }
    sceneElement.onpointerup = (event: PointerEvent): void => {
      if (!this.createButtonEventFromMouseEvent) {
        throw new Error('Compositor not initialized.')
      }

      event.preventDefault()
      this.buttonUp(this.createButtonEventFromMouseEvent(event, true, id))
      sceneElement.releasePointerCapture(event.pointerId)
    }
    sceneElement.onwheel = (event: WheelEvent): void => {
      if (!this.createAxisEventFromWheelEvent) {
        throw new Error('Compositor not initialized.')
      }

      event.preventDefault()
      this.axis(this.createAxisEventFromWheelEvent(event, id))
    }
    sceneElement.onkeydown = (event: KeyboardEvent): void => {
      if (!this.createKeyEventFromKeyboardEvent) {
        throw new Error('Compositor not initialized.')
      }

      event.preventDefault()
      this.key(this.createKeyEventFromKeyboardEvent(event, true))
    }
    sceneElement.onkeyup = (event: KeyboardEvent): void => {
      if (!this.createKeyEventFromKeyboardEvent) {
        throw new Error('Compositor not initialized.')
      }

      event.preventDefault()
      this.key(this.createKeyEventFromKeyboardEvent(event, false))
    }

    sceneElement.onmouseover = (): void => sceneElement.focus()
    sceneElement.tabIndex = 1

    sceneElement.style.display = 'none'
    sceneElement.id = id
    document.body.appendChild(sceneElement)
    return id
  }

  deleteCompositorScene(id: string): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }

    const sceneElement = document.getElementById(id)
    if (sceneElement && sceneElement.parentElement) {
      sceneElement.parentElement.removeChild(sceneElement)
      this.session.userShell.actions.destroyScene(id)
    }
  }

  createCompositorSurfaceView(view: UserShellSurfaceView): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }

    const userShellSurfaceKey = view.surfaceKey
    const compositorSurface = CompositorApi.compositorSurface(
      userShellSurfaceKey
    )
    this.session.userShell.actions.createView(compositorSurface, view.sceneId)
  }

  deleteCompositorClient(id: string): void {
    if (!this.session) {
      throw new Error('Compositor not initialized.')
    }

    this.session.userShell.actions.closeClient({ id })
  }

  async launchRemoteApp(appId: string, url: string): Promise<void> {
    if (!this.#remoteAppLauncher) {
      throw new Error('Compositor not initialized.')
    }

    await this.#remoteAppLauncher.launch(new URL(url), appId)
  }

  async launchWebApp(downloadURL: string): Promise<void> {
    if (!this.#webAppLauncher) {
      throw new Error('Compositor not initialized.')
    }

    await this.#webAppLauncher.launch(new URL(downloadURL))
  }
}

const compositorApi: CompositorApi = CompositorApi.create()
export default compositorApi

export function launchWebApp(downloadURL: string): Promise<void> {
  return compositorApi.launchWebApp(downloadURL)
}

export function launchRemoteApp(appId: string, url: string): Promise<void> {
  return compositorApi.launchRemoteApp(appId, url)
}

export function deleteCompositorClient(
  client: Pick<UserShellClient, 'id'>
): void {
  compositorApi.deleteCompositorClient(client.id)
}

export function createCompositorSurfaceView(view: UserShellSurfaceView): void {
  compositorApi.createCompositorSurfaceView(view)
}

export function raiseCompositorSurfaceView(view: UserShellSurfaceView): void {
  compositorApi.raiseCompositorSurfaceView(view)
}

export function createCompositorScene(): string {
  return compositorApi.createCompositorScene()
}

export function deleteCompositorScene(scene: Pick<UserShellScene, 'id'>): void {
  compositorApi.deleteCompositorScene(scene.id)
}

export function refreshCompositorScene(
  scene: Pick<UserShellScene, 'id'>
): Promise<void> {
  return compositorApi.refreshCompositorScene(scene.id)
}

export function updateCompositorKeyboardFocus(
  surface: Pick<UserShellSurface, 'key'>
): void {
  compositorApi.updateCompositorKeyboardFocus(surface.key)
}

export function requestCompositorSurfaceActive(
  surface: Pick<UserShellSurface, 'key'>
): void {
  compositorApi.requestCompositorSurfaceActive(surface.key)
}

export function notifyCompositorSurfaceInactive(
  surface: Pick<UserShellSurface, 'key'>
): void {
  compositorApi.notifyCompositorSurfaceInactive(surface.key)
}

export function createCompositor(): Promise<void> {
  return compositorApi.createCompositor()
}

export function compositorKeyboardDefaultNrmlvo(): nrmlvo {
  return compositorApi.compositorKeyboardDefaultNrmlvo()
}

export function compositorKeyboardNrmlvoEntries(): nrmlvo[] {
  return compositorApi.compositorKeyboardNrmlvoEntries()
}

export function updateCompositorConfiguration(
  configuration: Partial<UserShellConfiguration>
): void {
  compositorApi.updateCompositorConfiguration(configuration)
}

export function createButtonEventFromMouseEvent(
  mouseEvent: MouseEvent,
  released: boolean | null,
  sceneId: string
): ButtonEvent {
  if (!compositorApi.createButtonEventFromMouseEvent) {
    throw new Error('Compositor not initialized.')
  }

  return compositorApi.createButtonEventFromMouseEvent(
    mouseEvent,
    released,
    sceneId
  )
}

export function createAxisEventFromWheelEvent(
  wheelEvent: WheelEvent,
  sceneId: string
): AxisEvent {
  if (!compositorApi.createAxisEventFromWheelEvent) {
    throw new Error('Compositor not initialized.')
  }

  return compositorApi.createAxisEventFromWheelEvent(wheelEvent, sceneId)
}

export function createKeyEventFromKeyboardEvent(
  keyboardEvent: KeyboardEvent,
  down: boolean
): KeyEvent {
  if (!compositorApi.createKeyEventFromKeyboardEvent) {
    throw new Error('Compositor not initialized.')
  }

  return compositorApi.createKeyEventFromKeyboardEvent(keyboardEvent, down)
}

export function pointerMove(event: ButtonEvent): void {
  if (!compositorApi.session) {
    throw new Error('Compositor not initialized.')
  }

  compositorApi.session.userShell.actions.input.pointerMove(event)
}

export function buttonDown(event: ButtonEvent): void {
  if (!compositorApi.session) {
    throw new Error('Compositor not initialized.')
  }

  compositorApi.session.userShell.actions.input.buttonDown(event)
}

export function buttonUp(event: ButtonEvent): void {
  if (!compositorApi.session) {
    throw new Error('Compositor not initialized.')
  }

  compositorApi.session.userShell.actions.input.buttonUp(event)
}

export function axis(event: AxisEvent): void {
  if (!compositorApi.session) {
    throw new Error('Compositor not initialized.')
  }

  compositorApi.session.userShell.actions.input.axis(event)
}

export function key(event: KeyEvent): void {
  if (!compositorApi.session) {
    throw new Error('Compositor not initialized.')
  }

  compositorApi.session.userShell.actions.input.key(event)
}
