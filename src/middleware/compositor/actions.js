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
 * @type {function(payload: string):string}
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
export const launchApp = createAction('greenfield/compositor/launchApp')
/**
 * @type {function(payload: {type: string, url: string, title: string}):string}
 */
export const launchWebApp = createAction('greenfield/compositor/launchWebApp')
/**
 * @type {function(payload: {type: string, url: string, title: string}):string}
 */
export const launchRemoteApp = createAction('greenfield/compositor/launchRemoteApp')
/**
 * @type {function(payload: Object):string}
 */
export const remotePointerMove = createAction('greenfield/compositor/remotePointerMove')
/**
 * @type {function(payload: Object):string}
 */
export const remoteButtonUp = createAction('greenfield/compositor/remoteButtonUp')
/**
 * @type {function(payload: Object):string}
 */
export const remoteButtonDown = createAction('greenfield/compositor/remoteButtonDown')
/**
 * @type {function(payload: Object):string}
 */
export const remoteAxis = createAction('greenfield/compositor/remoteAxis')
/**
 * @type {function(payload: Object):string}
 */
export const remoteKey = createAction('greenfield/compositor/remoteKey')
/**
 * @type {function(payload: string):string}
 */
export const sendRemoteSceneUpdate = createAction('greenfield/compositor/sendRemoteSceneUpdate')
/**
 * @type {function(payload: {sceneId: string}):string}
 */
export const requestSceneAccess = createAction('greenfield/compositor/requestSceneAccess')
/**
 * @type {function(payload: {sceneId: string}):string}
 */
export const handleSceneAccessRequest = createAction('greenfield/compositor/handleSceneAccessRequest')
