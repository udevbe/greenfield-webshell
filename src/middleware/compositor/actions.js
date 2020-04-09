import { createAction } from '@reduxjs/toolkit'

export const createUserShellCompositor = createAction('greenfield/compositor/createUserShellCompositor')

export const createScene = createAction('greenfield/compositor/createScene')
export const refreshScene = createAction('greenfield/compositor/refreshScene')
export const markSceneLastActive = createAction('greenfield/compositor/markSceneLastActive')
export const activateScene = createAction(('greenfield/compositor/activateScene'))
export const updateScene = createAction('greenfield/compositor/updateScene')
export const deleteScene = createAction('greenfield/compositor/deleteScene')

export const requestSurfaceActive = createAction('greenfield/compositor/requestUserSurfaceActive')

export const deleteClient = createAction('greenfield/compositor/terminateClient')

export const launchWebAppAction = createAction('greenfield/compositor/launchWebApp')
export const launchRemoteAppAction = createAction('greenfield/compositor/launchRemoteApp')

export const remotePointerMoveAction = createAction('greenfield/compositor/remotePointerMove')

export const remoteButtonUpAction = createAction('greenfield/compositor/remoteButtonUp')

export const remoteButtonDownAction = createAction('greenfield/compositor/remoteButtonDown')

export const remoteAxisAction = createAction('greenfield/compositor/remoteAxis')

export const remoteKeyAction = createAction('greenfield/compositor/remoteKey')

export const sendRemoteSceneUpdateAction = createAction('greenfield/compositor/sendRemoteSceneUpdate')

export const requestSceneAccessAction = createAction('greenfield/compositor/requestSceneAccess')

export const handleSceneAccessRequestAction = createAction('greenfield/compositor/handleSceneAccessRequest')
