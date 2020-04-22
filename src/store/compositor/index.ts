import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type {
  CompositorClient,
  CompositorSurface,
  CompositorSurfaceState,
  nrmlvo,
} from 'compositor-module'
import Peer from 'peerjs'
import type { UserShellSurfaceKey } from '../../middleware/compositor/CompositorApi'

export type UserShellSurface = CompositorSurfaceState &
  CompositorSurface & { key: UserShellSurfaceKey }

export interface UserShellSurfaceView {
  surfaceKey: UserShellSurfaceKey
  sceneId: string
}

export interface LocalUserShellSceneState {
  sharing: 'public' | 'private'
  sharedWith: string[]
}

export interface RemoteUserShellSceneState {
  sharedWith: string[]
  sharedBy: string
  access: 'pending' | 'granted' | 'denied'
  scaling: { x: number; y: number }
}

export interface UserShellScene {
  views: UserShellSurfaceView[]
  name: string
  id: string
  type: 'local' | 'remote'
  lastActive: number
  state: LocalUserShellSceneState | RemoteUserShellSceneState
}

export type UserShellClient = CompositorClient

export interface UserShellKeyboard {
  nrmlvoEntries: nrmlvo[]
  defaultNrmlvo?: nrmlvo
}

export interface UserShellSeat {
  pointerGrab?: string
  keyboardFocus?: string
  keyboard: UserShellKeyboard
}

export interface UserShellConfiguration {
  scrollFactor: number
  keyboardLayoutName?: string
}

export interface UserShellCompositorState {
  clients: { [key: string]: UserShellClient }
  peer: { id?: string }
  initializing: boolean
  initialized: boolean
  seat: UserShellSeat
  surfaces: { [key: string]: UserShellSurface }
  configuration: UserShellConfiguration
  scenes: { [key: string]: UserShellScene }
}

// TODO add app launch error state
// TODO add last active scene id state
const initialState: UserShellCompositorState = {
  clients: {},
  peer: {
    id: undefined,
  },
  initializing: false,
  initialized: false,
  // TODO wayland supports multi seat and so should we...
  seat: {
    pointerGrab: undefined,
    keyboardFocus: undefined,
    keyboard: {
      nrmlvoEntries: [],
      defaultNrmlvo: undefined,
    },
  },
  surfaces: {},
  configuration: {
    scrollFactor: 1,
    keyboardLayoutName: undefined,
  },
  scenes: {},
}

const reducers = {
  initializingUserShellCompositor: (state: UserShellCompositorState): void => {
    state.initializing = true
  },

  initializedUserShellCompositor: (state: UserShellCompositorState): void => {
    state.initializing = false
    state.initialized = true
  },

  createUserShellClient: (
    state: UserShellCompositorState,
    { payload: client }: PayloadAction<UserShellClient>
  ): void => {
    state.clients[client.id] = client
  },

  deleteUserShellClient: (
    state: UserShellCompositorState,
    { payload: client }: PayloadAction<Pick<UserShellClient, 'id'>>
  ): void => {
    delete state.clients[client.id]
  },

  createUserShellSurface: (
    state: UserShellCompositorState,
    {
      payload: surface,
    }: PayloadAction<Pick<UserShellSurface, 'id' | 'clientId' | 'key'>>
  ): void => {
    state.surfaces[surface.key] = surface
  },

  updateUserShellSurface: (
    state: UserShellCompositorState,
    {
      payload: surface,
    }: PayloadAction<Pick<UserShellSurface, 'key'> & Partial<UserShellSurface>>
  ): void => {
    state.surfaces[surface.key] = {
      ...state.surfaces[surface.key],
      ...surface,
    }
  },

  deleteUserShellSurface: (
    state: UserShellCompositorState,
    { payload: surface }: PayloadAction<Pick<UserShellSurface, 'key'>>
  ): void => {
    delete state.surfaces[surface.key]
  },

  updateUserShellSeat: (
    state: UserShellCompositorState,
    { payload: seat }: PayloadAction<Partial<UserShellSeat>>
  ): void => {
    state.seat = { ...state.seat, ...seat }
  },

  updateUserShellConfiguration: (
    state: UserShellCompositorState,
    { payload: configuration }: PayloadAction<Partial<UserShellConfiguration>>
  ): void => {
    state.configuration = { ...state.configuration, ...configuration }
  },

  createUserShellSurfaceView: (
    state: UserShellCompositorState,
    { payload: view }: PayloadAction<UserShellSurfaceView>
  ): void => {
    state.scenes[view.sceneId].views.push(view)
  },

  deleteUserShellSurfaceView: (
    state: UserShellCompositorState,
    { payload: view }: PayloadAction<UserShellSurfaceView>
  ): void => {
    const { sceneId, surfaceKey } = view
    state.scenes[sceneId].views = state.scenes[sceneId].views.filter(
      (view) => view.surfaceKey !== surfaceKey && view.sceneId !== sceneId
    )
  },

  createUserShellScene: (
    state: UserShellCompositorState,
    { payload: scene }: PayloadAction<UserShellScene>
  ): void => {
    state.scenes[scene.id] = scene
  },

  deleteUserShellScene: (
    state: UserShellCompositorState,
    { payload: scene }: PayloadAction<Pick<UserShellScene, 'id'>>
  ): void => {
    delete state.scenes[scene.id]
  },

  createPeer(
    state: UserShellCompositorState,
    { payload: peer }: PayloadAction<Pick<Peer, 'id'>>
  ): void {
    state.peer.id = peer.id
  },

  setRemoteSceneScaling: (
    state: UserShellCompositorState,
    {
      payload: { scene, state: sceneState },
    }: PayloadAction<{
      scene: Pick<UserShellScene, 'id'>
      state: Pick<RemoteUserShellSceneState, 'scaling'>
    }>
  ): void => {
    const remoteUserShellSceneState = state.scenes[scene.id]
      .state as RemoteUserShellSceneState
    remoteUserShellSceneState.scaling = sceneState.scaling
  },

  updateUserShellScene: (
    state: UserShellCompositorState,
    {
      payload: scene,
    }: PayloadAction<Pick<UserShellScene, 'id'> & Partial<UserShellScene>>
  ): void => {
    state.scenes[scene.id] = { ...state.scenes[scene.id], ...scene }
  },
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/compositor',
})

export const {
  initializingUserShellCompositor,
  initializedUserShellCompositor,

  createUserShellClient,
  deleteUserShellClient,

  createUserShellSurface,
  updateUserShellSurface,
  deleteUserShellSurface,

  updateUserShellSeat,

  updateUserShellConfiguration,

  createUserShellSurfaceView,
  deleteUserShellSurfaceView,

  createUserShellScene,
  updateUserShellScene,
  deleteUserShellScene,

  createPeer,

  setRemoteSceneScaling,
} = slice.actions

export default slice.reducer
