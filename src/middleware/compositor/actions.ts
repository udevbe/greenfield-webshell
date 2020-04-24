import { createAction } from '@reduxjs/toolkit'
import type Peer from 'peerjs'
import type {
  UserShellClient,
  UserShellScene,
  UserShellSurface,
} from '../../store/compositor'

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

export const activateLastActiveScene = createAction(
  'greenfield/compositor/activateLastActiveScene'
)

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
