import { createAction } from '@reduxjs/toolkit'
import type { AxisEvent, ButtonEvent, KeyEvent } from 'compositor-module'
import type Peer from 'peerjs'
import type {
  UserShellClient,
  UserShellScene,
  UserShellSurface,
  RemoteUserShellSceneState,
} from '../../store/compositor'

// TODO move these types to public greenfield types

export const createUserShellCompositor = createAction(
  'greenfield/compositor/createUserShellCompositor'
)

export const createScene = createAction<
  Pick<UserShellScene, 'name' | 'type'>,
  'greenfield/compositor/createScene'
>('greenfield/compositor/createScene')

export const refreshScene = createAction<
  Pick<UserShellScene, 'id'>,
  'greenfield/compositor/refreshScene'
>('greenfield/compositor/refreshScene')

export const markSceneLastActive = createAction<
  Pick<UserShellScene, 'id'>,
  'greenfield/compositor/markSceneLastActive'
>('greenfield/compositor/markSceneLastActive')

export const activateScene = createAction<
  Pick<UserShellScene, 'id'>,
  'greenfield/compositor/activateScene'
>('greenfield/compositor/activateScene')

export const updateSceneName = createAction<
  Pick<UserShellScene, 'id' | 'name'>,
  'greenfield/compositor/updateSceneName'
>('greenfield/compositor/updateSceneName')

export const deleteScene = createAction<
  Pick<UserShellScene, 'id'>,
  'greenfield/compositor/deleteScene'
>('greenfield/compositor/deleteScene')

export const requestSurfaceActive = createAction<
  Pick<UserShellSurface, 'key'>,
  'greenfield/compositor/requestUserSurfaceActive'
>('greenfield/compositor/requestUserSurfaceActive')

export const deleteClient = createAction<
  Pick<UserShellClient, 'id'>,
  'greenfield/compositor/terminateClient'
>('greenfield/compositor/terminateClient')

export const launchWebAppAction = createAction<
  { application: { title: string }; downloadURL: string },
  'greenfield/compositor/launchWebApp'
>('greenfield/compositor/launchWebApp')

export const launchRemoteAppAction = createAction<
  { application: { url: string; title: string }; id: string },
  'greenfield/compositor/launchRemoteApp'
>('greenfield/compositor/launchRemoteApp')

export const remotePointerMove = createAction<
  ButtonEvent,
  'greenfield/compositor/remotePointerMove'
>('greenfield/compositor/remotePointerMove')

export const remoteButtonUp = createAction<
  ButtonEvent,
  'greenfield/compositor/remoteButtonUp'
>('greenfield/compositor/remoteButtonUp')
export const remoteButtonDown = createAction<
  ButtonEvent,
  'greenfield/compositor/remoteButtonDown'
>('greenfield/compositor/remoteButtonDown')

export const remoteAxis = createAction<
  AxisEvent,
  'greenfield/compositor/remoteAxis'
>('greenfield/compositor/remoteAxis')

export const remoteKey = createAction<
  KeyEvent,
  'greenfield/compositor/remoteKey'
>('greenfield/compositor/remoteKey')

export const sendRemoteSceneUpdate = createAction<
  Pick<UserShellScene, 'id'>,
  'greenfield/compositor/sendRemoteSceneUpdate'
>('greenfield/compositor/sendRemoteSceneUpdate')

export const makeScenePublic = createAction<
  Pick<UserShellScene, 'id'>,
  'greenfield/compositor/makeScenePublic'
>('greenfield/compositor/makeScenePublic')

export const makeScenePrivate = createAction<
  Pick<UserShellScene, 'id'>,
  'greenfield/compositor/makeScenePrivate'
>('greenfield/compositor/makeScenePrivate')

export const requestSceneAccess = createAction<
  { scene: Pick<UserShellScene, 'id'>; peer: Pick<Peer, 'id'> },
  'greenfield/compositor/requestSceneAccess'
>('greenfield/compositor/requestSceneAccess')

export const sceneAccessGranted = createAction<
  {
    scene: Pick<UserShellScene, 'id'>
    state: Pick<RemoteUserShellSceneState, 'sharedWith' | 'sharedBy'>
  },
  'greenfield/compositor/sceneAccessGranted'
>('greenfield/compositor/sceneAccessGranted')

export const sceneAccessDenied = createAction<
  Pick<UserShellScene, 'id'>,
  'greenfield/compositor/sceneAccessDenied'
>('greenfield/compositor/sceneAccessDenied')

export const sceneAccessRequest = createAction<
  { scene: Pick<UserShellScene, 'id'>; uid: string },
  'greenfield/compositor/handleSceneAccessRequest'
>('greenfield/compositor/handleSceneAccessRequest')
