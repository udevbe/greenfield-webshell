import { createAction } from '@reduxjs/toolkit'

/**
 * @type {function(payload: string):string}
 */
export const requestUserSurfaceActive = createAction('greenfield/compositor/requestUserSurfaceActive')
/**
 * @type {function(payload: string):string}
 */
export const refreshScene = createAction('greenfield/compositor/refreshScene')
/**
 * @type {function(payload: {userSurfaceKey: string}):string}
 */
export const notifyUserSurfaceInactive = createAction('greenfield/compositor/notifyUserSurfaceInactive')
/**
 * @type {function(payload: string):string}
 */
export const userSurfaceKeyboardFocus = createAction('greenfield/compositor/userSurfaceKeyboardFocus')
/**
 * @type {function(payload: string):string}
 */
export const terminateClient = createAction('greenfield/compositor/terminateClient')
/**
 * @type {function(payload: {appId: string}):string}
 */
export const launchAppAction = createAction('greenfield/compositor/launchApp')
/**
 * @type {function(payload: {type: string, url: string, title: string}):string}
 */
export const launchWebAppAction = createAction('greenfield/compositor/launchWebApp')
/**
 * @type {function(payload: {type: string, url: string, title: string}):string}
 */
export const launchRemoteAppAction = createAction('greenfield/compositor/launchRemoteApp')
/**
 * @type {function(payload: Object):string}
 */
export const remotePointerMoveAction = createAction('greenfield/compositor/remotePointerMove')
/**
 * @type {function(payload: Object):string}
 */
export const remoteButtonUpAction = createAction('greenfield/compositor/remoteButtonUp')
/**
 * @type {function(payload: Object):string}
 */
export const remoteButtonDownAction = createAction('greenfield/compositor/remoteButtonDown')
/**
 * @type {function(payload: Object):string}
 */
export const remoteAxisAction = createAction('greenfield/compositor/remoteAxis')
/**
 * @type {function(payload: Object):string}
 */
export const remoteKeyAction = createAction('greenfield/compositor/remoteKey')
/**
 * @type {function(payload: string):string}
 */
export const sendRemoteSceneUpdateAction = createAction('greenfield/compositor/sendRemoteSceneUpdate')
/**
 * @type {function(payload: {sceneId: string}):string}
 */
export const requestSceneAccessAction = createAction('greenfield/compositor/requestSceneAccess')
/**
 * @type {function(payload: {sceneId: string}):string}
 */
export const handleSceneAccessRequestAction = createAction('greenfield/compositor/handleSceneAccessRequest')
