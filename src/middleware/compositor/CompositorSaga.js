import {
  launchAppAction,
  notifyUserSurfaceInactive,
  refreshScene,
  requestUserSurfaceActive,
  terminateClient,
  userSurfaceKeyboardFocus
} from './actions'
import { all, call, put, race, select, take, takeEvery, takeLatest } from 'redux-saga/effects'
import { buffers, eventChannel } from 'redux-saga'

import compositorApi from './CompositorApi'
import {
  clientCreated,
  clientDestroyed,
  createScene,
  createUserSurface,
  createUserSurfaceView,
  destroyScene,
  destroyUserSurfaceView,
  initializeCompositor,
  markSceneLastActive,
  updateUserConfiguration,
  updateUserSeat,
  updateUserSurface,
  userSurfaceDestroyed
} from '../../store/compositor'

const onNotifyChannel = eventChannel(emitter => { compositorApi.onNotify = event => emitter(event) }, buffers.expanding(3))
const onCreateApplicationClientChannel = eventChannel(emitter => { compositorApi.onCreateApplicationClient = event => emitter(event) }, buffers.expanding(3))
const onDestroyApplicationClientChannel = eventChannel(emitter => { compositorApi.onDestroyApplicationClient = event => emitter(event) }, buffers.expanding(3))
const onCreateUserSurfaceChannel = eventChannel(emitter => { compositorApi.onCreateUserSurface = event => emitter(event) }, buffers.expanding(3))
const onUpdateUserSurfaceChannel = eventChannel(emitter => { compositorApi.onUpdateUserSurface = event => emitter(event) }, buffers.sliding(1))
const onDestroyUserSurfaceChannel = eventChannel(emitter => { compositorApi.onDestroyUserSurface = event => emitter(event) }, buffers.expanding(3))
const onUpdateUserSeatChannel = eventChannel(emitter => { compositorApi.onUpdateUserSeat = event => emitter(event) }, buffers.sliding(1))

/**
 * @param {{compositor:CompositorState}}state
 * @param {string}userSurfaceKey
 * @return {UserSurfaceView[]}
 */
const viewsOfUserSurfaceSelector = (state, userSurfaceKey) => Object.values(state.compositor.scenes).map(scene => scene.views).flat().filter(view => view.userSurfaceKey === userSurfaceKey)
/**
 * @param {{compositor:CompositorState}}state
 * @return {?string}
 */
const pointerGrabSelector = state => state.compositor.seat.pointerGrab
/**
 * @param {{compositor:CompositorState}}state
 * @return {?string}
 */
const keyboardFocusSelector = state => state.compositor.seat.keyboardFocus
/**
 * @param {Scene[]}scenes
 * @return {Scene}
 */
const lastActiveScene = scenes => scenes.reduce((previousValue, currentValue) => previousValue.lastActive > currentValue.lastActive ? previousValue : currentValue)
/**
 * @param {{compositor:CompositorState}}state
 * @return {Scene}
 */
const lastActiveSceneSelector = state => lastActiveScene(Object.values(state.compositor.scenes))
/**
 * @param {{compositor:CompositorState}}state
 * @param {string}sceneId
 * @return {Scene}
 */
const lastActiveSceneExcludingSelector = (state, sceneId) => lastActiveScene(Object.values(state.compositor.scenes).filter(scene => scene.id !== sceneId))
/**
 * @param {{compositor:CompositorState}}state
 * @param {string}clientId
 * @return {UserSurface[]}
 */
const userSurfacesFromClientSelector = (state, clientId) => Object.values(state.compositor.userSurfaces).filter(userSurface => userSurface.clientId === clientId)

/**
 * @param {string} appId
 * @param {string} url
 * @param {string} title
 * @return {Generator<*, void, ?>}
 */
function * launchRemoteApp ({ payload: { appId, url, title } }) {
  yield compositorApi.launchRemoteApp(appId, url, title)
  // TODO dispatch launch failure action for app instead
  // .catch(function (error) {
  //   store.dispatch(showNotification({
  //     variant: 'error',
  //     message: `${title} failed to launch. ${error.message}`
  //   }))
  // })
}

function * launchWebApp ({ payload: { appId, downloadURL } }) {
  yield compositorApi.launchWebApp(downloadURL)
  // TODO dispatch launch failure action for app instead
// .catch(function (error) {
//     // TODO A full list of error codes is available at https://firebase.google.com/docs/storage/web/handle-errors
//     switch (error.code) {
//       case 'storage/object-not-found':
//         store.dispatch(showNotification({
//           variant: 'error',
//           message: `${title} application could not be found on server.`
//         }))
//         break
//       case 'storage/unauthorized':
//         store.dispatch(showNotification({ variant: 'error', message: `Not authorized to launch ${title}.` }))
//         break
//       case 'storage/unknown':
//       default:
//         store.dispatch(showNotification({
//           variant: 'error',
//           message: `${title} failed to launch. ${error.message}`
//         }))
//         break
//     }
//   })
}

function * handleLaunchApp ({ payload: { appId } }) {
  // TODO
}

function * watchLaunchApp () {
  yield takeEvery(launchAppAction, handleLaunchApp)
}

function * handleUserSurfaceInactive ({ payload: { userSurfaceKey } }) {
  yield call(compositorApi.notifyUserSurfaceInactiveAction, userSurfaceKey)
}

function * watchUserSurfaceInactive () {
  yield takeLatest(notifyUserSurfaceInactive, handleUserSurfaceInactive)
}

function * handleUserSurfaceUpdate ({ userShellSurface, userShellSurfaceState, key }) {
  const userSurface = { ...userShellSurfaceState, ...userShellSurface, key }
  if (userSurface.active) {
    userSurface.lastActive = Date.now()
  }
  yield put(updateUserSurface({ userSurface }))
}

function * watchUserSurfaceUpdate () {
  yield takeLatest(onUpdateUserSurfaceChannel, handleUserSurfaceUpdate)
}

function * handleUserSurfaceViewLifecycle ({ payload: { userSurfaceView } }) {
  yield call(compositorApi.createUserSurfaceView, userSurfaceView)

  const { sceneDestroyed } = yield race({
    userSurfaceViewDestroyed:
      take(({ type, payload: { userSurfaceView: { sceneId, userSurfaceKey } } }) =>
        (type === destroyUserSurfaceView) && (sceneId === userSurfaceView.sceneId) && (userSurfaceKey === userSurfaceView.userSurfaceKey)),
    sceneDestroyed:
      take(({ type, payload: { sceneId } }) =>
        (type === destroyScene) && (sceneId === userSurfaceView.sceneId))
  })

  if (sceneDestroyed) {
    yield put(destroyUserSurfaceView({ userSurfaceView }))
  }
}

function * watchUserSurfaceViewCreation () {
  yield takeEvery(createUserSurfaceView, handleUserSurfaceViewLifecycle)
}

function * destroyViewsFromSurface (userSurfaceKey) {
  const userSurfaceViews = yield select(viewsOfUserSurfaceSelector, userSurfaceKey)
  yield all(userSurfaceViews.map(userSurfaceView => put(destroyUserSurfaceView(userSurfaceView))))
}

function * removeUserSeatGrabsIfSurfaceMatches (userSurfaceKey) {
  const { pointerGrab, keyboardFocus } = yield all({
    pointerGrab: select(pointerGrabSelector),
    keyboardFocus: select(keyboardFocusSelector)
  })
  const userSeat = { pointerGrab, keyboardFocus }

  if (pointerGrab && pointerGrab === userSurfaceKey) {
    userSeat.pointerGrab = null
  }
  if (keyboardFocus && keyboardFocus === userSurfaceKey) {
    userSeat.keyboardFocus = null
  }
  yield put(updateUserSeat({ userSeat }))
}

function * handleUserSurfaceLifecycle ({ userShellSurface, userShellSurfaceState, key }) {
  yield put(createUserSurface({ ...userShellSurfaceState, ...userShellSurface, key }))
  const lastActiveScene = yield select(lastActiveSceneSelector)
  const lastActiveSceneId = lastActiveScene.id

  yield put(createUserSurfaceView({ userSurfaceView: { userSurfaceKey: key, sceneId: lastActiveSceneId } }))

  yield call(compositorApi.requestUserSurfaceActive, key)
  yield call(compositorApi.raiseUserSurface, key, lastActiveSceneId)

  yield take(userSurfaceDestroyed)

  yield all([
    call(destroyViewsFromSurface, key),
    call(removeUserSeatGrabsIfSurfaceMatches, key)
  ])
}

function * watchUserSurfaceCreation () {
  yield takeEvery(onCreateUserSurfaceChannel, handleUserSurfaceLifecycle)
}

function * handleDestroyUserSurface ({ userSurfaceKey }) {
  yield put(userSurfaceDestroyed({ userSurfaceKey }))
}

function * watchUserSurfaceDestruction () {
  yield takeEvery(onDestroyUserSurfaceChannel, handleDestroyUserSurface)
}

function * handleClientLifecycle ({ client }) {
  yield put(clientCreated({ client }))

  yield take(({ type, payload: { clientId } }) => type === clientDestroyed && clientId === client.id)
  // TODO listen for user surface creation from client instead of using selector
  const userSurfaces = yield select(userSurfacesFromClientSelector, client.id)
  yield all(
    userSurfaces.map(userSurface =>
      put(userSurfaceDestroyed({ userSurfaceKey: userSurface.key }))
    )
  )
}

function * watchClientCreation () {
  yield takeEvery(onCreateApplicationClientChannel, handleClientLifecycle)
}

function * handleDestroyApplicationClient ({ payload: { clientId } }) {
  yield put(clientDestroyed({ clientId }))
}

function * watchClientDestruction () {
  yield takeEvery(onDestroyApplicationClientChannel, handleDestroyApplicationClient)
}

function * handleRefreshLocalScene (sceneId) {
  yield call(compositorApi.refreshScene, sceneId)
}

function * watchRefreshLocalScene (sceneId) {
  yield takeLatest(action => (action.type === refreshScene) && (action.payload.sceneId === sceneId), handleRefreshLocalScene, sceneId)
}

function * handleMarkSceneLastActive ({ payload }) {
  payload.lastActive = Date.now()
}

function * watchSceneMarkLastActive () {
  yield takeLatest(markSceneLastActive, handleMarkSceneLastActive)
}

function * handleSceneLifecycle ({ payload }) {
  if (payload.scene.type === 'local') {
    const id = yield call(compositorApi.createScene, payload.scene.type)
    yield call(watchRefreshLocalScene, id)

    payload.scene = {
      ...payload.scene,
      id,
      views: [],
      lastActive: Date.now(),
      state: { sharing: 'private', shared_with: [] }
    }

    const { payload: { sceneId } } = yield take(action => (action.type === destroyScene) && (action.payload.sceneId === id))
    yield call(compositorApi.destroyScene, sceneId)
    const newActiveScene = yield select(lastActiveSceneExcludingSelector, sceneId)
    yield put(markSceneLastActive({ sceneId: newActiveScene.id }))
  }
}

function * watchSceneCreation () {
  yield takeEvery(createScene, handleSceneLifecycle)
}

function * handleUserSurfaceActive ({ payload: { userSurfaceKey } }) {
  yield call(compositorApi.requestUserSurfaceActive, userSurfaceKey)
}

function * watchRequestUserSurfaceActive () {
  yield takeLatest(requestUserSurfaceActive, handleUserSurfaceActive)
}

function * handleTerminateClient ({ payload: { clientId } }) {
  yield call(compositorApi.terminateClient, clientId)
}

function * watchTerminateClient () {
  yield takeEvery(terminateClient, handleTerminateClient)
}

function * handleUserSurfaceKeyboardFocus ({ payload: { userSurfaceKey } }) {
  const userSeat = { keyboardFocus: userSurfaceKey }
  yield all([
    put(updateUserSeat({ userSeat })),
    call(compositorApi.userSurfaceKeyboardFocus, userSurfaceKey)
  ])
}

function * watchUserSurfaceKeyboardFocus () {
  yield takeLatest(userSurfaceKeyboardFocus, handleUserSurfaceKeyboardFocus)
}

function * handleUpdateUserSeat ({ userSeat }) {
  yield put(updateUserSeat({ userSeat }))
}

function * watchUpdateUserSeat () {
  yield takeLatest(onUpdateUserSeatChannel, handleUpdateUserSeat)
}

function * handleOnNotify ({ variant, message }) {
  // TODO
}

function * watchNotify () {
  takeEvery(onNotifyChannel, handleOnNotify)
}

let compositorInitialized = false

function * handleInitializeCompositor () {
  if (compositorInitialized) {
    return
  }

  yield call(compositorApi.initializeCompositor)
  yield all([
    put(updateUserSeat({
      userSeat: {
        pointerGrab: null,
        keyboardFocus: null,
        keyboard: {
          nrmlvoEntries: [...compositorApi.keyboardNrmlvoEntries()],
          defaultNrmlvo: compositorApi.keyboardDefaultNrmlvo()
        }
      }
    })),
    put(createScene({ name: 'default', type: 'local' }))
  ])

  compositorInitialized = true
}

function * watchInitializeCompositor () {
  yield takeLatest(initializeCompositor, handleInitializeCompositor)
}

function * handleUpdateUserConfiguration ({ userConfiguration }) {
  yield call(compositorApi.setUserConfiguration, userConfiguration)
}

function * watchUpdateUserConfiguration () {
  yield takeLatest(updateUserConfiguration, handleUpdateUserConfiguration)
}

export default function * rootSaga () {
  yield all([
    watchLaunchApp,

    watchUserSurfaceUpdate,
    watchUserSurfaceViewCreation,
    watchUserSurfaceCreation,
    watchUserSurfaceDestruction,
    watchRequestUserSurfaceActive,
    watchUserSurfaceInactive,

    watchClientCreation,
    watchClientDestruction,

    watchSceneCreation,
    watchSceneMarkLastActive,

    watchTerminateClient,

    watchUserSurfaceKeyboardFocus,
    watchUpdateUserSeat,

    watchNotify,

    watchUpdateUserConfiguration,
    watchInitializeCompositor
  ])
}
