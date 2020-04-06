import {
  createScene,
  createUserShellCompositor,
  deleteClient,
  launchRemoteAppAction,
  launchWebAppAction,
  markSceneLastActive,
  refreshScene,
  requestSurfaceActive
} from './actions'
import { all, call, fork, put, race, select, take, takeEvery, takeLatest } from 'redux-saga/effects'
import { buffers, eventChannel } from 'redux-saga'

import compositorApi, {
  compositorKeyboardDefaultNrmlvo,
  compositorKeyboardNrmlvoEntries,
  createCompositor,
  createCompositorScene,
  createCompositorSurfaceView,
  deleteCompositorClient,
  deleteCompositorScene,
  launchRemoteApp,
  launchWebApp,
  notifyCompositorSurfaceInactive,
  raiseCompositorSurfaceView,
  refreshCompositorScene,
  requestCompositorSurfaceActive,
  updateCompositorConfiguration
} from './CompositorApi'
import {
  createUserShellClient,
  createUserShellScene,
  createUserShellSurface,
  createUserShellSurfaceView,
  deleteUserShellClient,
  deleteUserShellScene,
  deleteUserShellSurface,
  deleteUserShellSurfaceView,
  initializedUserShellCompositor,
  initializingUserShellCompositor,
  updateUserShellConfiguration,
  updateUserShellScene,
  updateUserShellSeat,
  updateUserShellSurface
} from '../../store/compositor'
import { showNotification } from '../../store/notification'

const subscribeToCompositorApi = eventName => eventChannel(emitter => {
  compositorApi[eventName] = event => emitter(event)
  return () => { compositorApi[eventName] = () => {} }
}, buffers.expanding(2))

const onNotifyChannel = subscribeToCompositorApi('onNotify', buffers.expanding(3))

const onCreateApplicationClient = subscribeToCompositorApi('onCreateUserShellClient')
const onDeleteUserShellClient = subscribeToCompositorApi('onDeleteUserShellClient')

const onCreateUserShellSurface = subscribeToCompositorApi('onCreateUserShellSurface')
const onUpdateUserShellSurface = subscribeToCompositorApi('onUpdateUserShellSurface')
const onDeleteUserShellSurface = subscribeToCompositorApi('onDeleteUserShellSurface')

const onUpdateUserShellSeat = subscribeToCompositorApi('onUpdateUserShellSeat')

/**
 * @param {{compositor:UserShellCompositorState}}state
 * @param {string}userSurfaceKey
 * @return {UserShellSurfaceView[]}
 */
const viewsOfUserSurfaceSelector = (state, userSurfaceKey) => Object.values(state.compositor.scenes).map(scene => scene.views).flat().filter(view => view.userSurfaceKey === userSurfaceKey)
/**
 * @param {{compositor:UserShellCompositorState}}state
 * @return {?string}
 */
const pointerGrabSelector = state => state.compositor.seat.pointerGrab
/**
 * @param {{compositor:UserShellCompositorState}}state
 * @return {?string}
 */
const keyboardFocusSelector = state => state.compositor.seat.keyboardFocus
/**
 * @param {UserShellScene[]}scenes
 * @return {UserShellScene}
 */
const lastActiveScene = scenes => scenes.reduce((previousValue, currentValue) => previousValue.lastActive > currentValue.lastActive ? previousValue : currentValue)
/**
 * @param {{compositor:UserShellCompositorState}}state
 * @return {UserShellScene}
 */
const lastActiveSceneSelector = state => lastActiveScene(Object.values(state.compositor.scenes))
/**
 * @param {{compositor:UserShellCompositorState}}state
 * @param {string}sceneId
 * @return {UserShellScene}
 */
const lastActiveSceneExcludingSelector = (state, sceneId) => lastActiveScene(Object.values(state.compositor.scenes).filter(scene => scene.id !== sceneId))
/**
 * @param {{compositor:UserShellCompositorState}}state
 * @param {string}clientId
 * @return {UserShellSurface[]}
 */
const userSurfacesFromClientSelector = (state, clientId) => Object.values(state.compositor.surfaces).filter(userSurface => userSurface.clientId === clientId)

/**
 * @param {string} appId
 * @param {string} url
 * @param {string} title
 * @return {Generator<*, void, ?>}
 */
function * handleLaunchRemoteApp ({ payload: { appId, url, title } }) {
  try {
    yield call(launchRemoteApp, appId, url, title)
  } catch (error) {
    yield put(showNotification({
      variant: 'error',
      message: `${title} failed to launch. ${error.message}`
    }))
  }
}

function * handleLaunchWebApp ({ payload: { title, downloadURL } }) {
  try {
    yield call(launchWebApp, downloadURL)
  } catch (error) {
    // TODO A full list of error codes is available at https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
      case 'storage/object-not-found':
        yield put(showNotification({
          variant: 'error',
          message: `${title} application could not be found on server.`
        }))
        break
      case 'storage/unauthorized':
        yield put(showNotification({ variant: 'error', message: `Not authorized to launch ${title}.` }))
        break
      case 'storage/unknown':
      default:
        yield put(showNotification({
          variant: 'error',
          message: `${title} failed to launch. ${error.message}`
        }))
        break
    }
  }
}

function * watchLaunchWebApp () {
  yield takeEvery(launchWebAppAction, handleLaunchWebApp)
}

function * watchLaunchRemoteApp () {
  yield takeEvery(launchRemoteAppAction, handleLaunchRemoteApp)
}

function * handleUserSurfaceUpdate ({ surface }) {
  if (surface.active) {
    surface.lastActive = Date.now()
  }
  yield put(updateUserShellSurface({ surface }))
}

function * watchUserSurfaceUpdate () {
  yield takeLatest(onUpdateUserShellSurface, handleUserSurfaceUpdate)
}

function * watchActiveUserSurface () {
  /**
   * @type {UserShellSurface|null}
   */
  let currentActiveSurfaceKey = null
  let currentActiveSurfaceLastActive = 0

  while (true) {
    const [
      updatedSurfaceAction,
      destroyedSurfaceAction,
      updateSeatAction
    ] = yield race([
      take(updateUserShellSurface),
      take(deleteUserShellSurface),
      take(updateUserShellSeat)
    ])

    if (updateSeatAction) {
      const pointerGrabUserSurfaceKey = updateSeatAction.payload.seat.pointerGrab

      if ((pointerGrabUserSurfaceKey && currentActiveSurfaceKey && currentActiveSurfaceKey !== pointerGrabUserSurfaceKey) ||
        (pointerGrabUserSurfaceKey && !currentActiveSurfaceKey)) {
        yield put(requestSurfaceActive({ key: pointerGrabUserSurfaceKey }))

        const lastActiveScene = yield select(lastActiveSceneSelector)
        const sceneId = lastActiveScene.id
        const view = { surfaceKey: pointerGrabUserSurfaceKey, sceneId }
        yield call(raiseCompositorSurfaceView, view)
      }

      continue
    }

    if (destroyedSurfaceAction) {
      const destroyedUserSurfaceKey = destroyedSurfaceAction.payload.key

      if (currentActiveSurfaceKey && (destroyedUserSurfaceKey === currentActiveSurfaceKey)) {
        currentActiveSurfaceKey = null
        currentActiveSurfaceLastActive = 0
      }

      continue
    }

    if (updatedSurfaceAction) {
      const updatedSurface = updatedSurfaceAction.payload.surface

      if (currentActiveSurfaceKey && (updatedSurface.key === currentActiveSurfaceKey) && !updatedSurface.active) {
        yield call(notifyCompositorSurfaceInactive, currentActiveSurfaceKey)
        currentActiveSurfaceKey = null
        currentActiveSurfaceLastActive = 0
      } else if (!currentActiveSurfaceKey && updatedSurface.active) {
        currentActiveSurfaceKey = updatedSurface.key
        currentActiveSurfaceLastActive = updatedSurface.lastActive
      } else if (currentActiveSurfaceKey && (updatedSurface.key !== currentActiveSurfaceKey) && (updatedSurface.lastActive > currentActiveSurfaceLastActive)) {
        const oldActiveUserSurfaceKey = currentActiveSurfaceKey
        currentActiveSurfaceKey = updatedSurface.key
        currentActiveSurfaceLastActive = updatedSurface.lastActive
        yield call(notifyCompositorSurfaceInactive, oldActiveUserSurfaceKey)
      }

      continue
    }
  }
}

function * handleUserSurfaceViewLifecycle ({ payload: { view } }) {
  yield call(createCompositorSurfaceView, view)

  const { sceneDestroyed } = yield race({
    surfaceViewDestroyed:
      take(({ type, payload }) =>
        (type === deleteUserShellSurfaceView) && (payload.view.sceneId === view.sceneId) && (payload.view.userSurfaceKey === view.surfaceKey)),
    sceneDestroyed:
      take(({ type, payload }) =>
        (type === deleteUserShellScene) && (payload.sceneId === view.sceneId))
  })

  if (sceneDestroyed) {
    yield put(deleteUserShellSurfaceView({ view }))
  }
}

function * watchUserSurfaceViewCreation () {
  yield takeEvery(createUserShellSurfaceView, handleUserSurfaceViewLifecycle)
}

function * destroyViewsFromSurface (surfaceKey) {
  const userSurfaceViews = yield select(viewsOfUserSurfaceSelector, surfaceKey)
  yield all(userSurfaceViews.map(view => put(deleteUserShellSurfaceView({ view }))))
}

function * removeUserSeatGrabsIfSurfaceMatches (surfaceKey) {
  const { pointerGrab, keyboardFocus } = yield all({
    pointerGrab: select(pointerGrabSelector),
    keyboardFocus: select(keyboardFocusSelector)
  })
  const seat = { pointerGrab, keyboardFocus }

  if (pointerGrab && pointerGrab === surfaceKey) {
    seat.pointerGrab = null
  }
  if (keyboardFocus && keyboardFocus === surfaceKey) {
    seat.keyboardFocus = null
  }
  yield put(updateUserShellSeat({ seat }))
}

function * handleUserSurfaceLifecycle ({ surface }) {
  const surfaceKey = surface.key
  yield put(createUserShellSurface({ surface }))
  const lastActiveScene = yield select(lastActiveSceneSelector)
  const sceneId = lastActiveScene.id
  const view = { surfaceKey, sceneId }
  yield put(createUserShellSurfaceView({ view }))

  yield call(raiseCompositorSurfaceView, view)
  yield put(requestSurfaceActive({ key: surfaceKey }))

  yield take(deleteUserShellSurface)

  yield all([
    call(destroyViewsFromSurface, surfaceKey),
    call(removeUserSeatGrabsIfSurfaceMatches, surfaceKey)
  ])
}

function * watchUserSurfaceCreation () {
  yield takeEvery(onCreateUserShellSurface, handleUserSurfaceLifecycle)
}

function * handleDestroyUserSurface ({ key }) {
  yield put(deleteUserShellSurface({ key }))
}

function * watchUserSurfaceDestruction () {
  yield takeEvery(onDeleteUserShellSurface, handleDestroyUserSurface)
}

function * handleClientLifecycle ({ client }) {
  yield put(createUserShellClient({ client }))

  yield take(({ type, payload }) => type === deleteUserShellClient && payload.id === client.id)
  // TODO listen for user surface creation from client instead of using selector
  const userSurfaces = yield select(userSurfacesFromClientSelector, client.id)
  yield all(
    userSurfaces.map(userSurface =>
      put(deleteUserShellSurface({ key: userSurface.key }))
    )
  )
}

function * watchClientCreation () {
  yield takeEvery(onCreateApplicationClient, handleClientLifecycle)
}

function * handleDeleteUserShellClient ({ id }) {
  yield put(deleteUserShellClient({ id }))
}

function * watchClientDestruction () {
  yield takeEvery(onDeleteUserShellClient, handleDeleteUserShellClient)
}

function * handleRefreshLocalScene (id) {
  yield call(refreshCompositorScene, id)
}

function * watchRefreshLocalScene (id) {
  yield takeLatest(action => (action.type === refreshScene) && (action.payload.id === id), handleRefreshLocalScene, id)
}

function * handleMarkSceneLastActive ({ payload: { id } }) {
  yield put(updateUserShellScene({ id, lastActive: Date.now() }))
}

function * watchSceneMarkLastActive () {
  yield takeLatest(markSceneLastActive, handleMarkSceneLastActive)
}

function * handleSceneLifecycle ({ payload: { scene: { type, name }, creationCallback } }) {
  if (type === 'local') {
    const id = yield call(createCompositorScene, type)
    const scene = {
      id,
      type,
      name,
      views: [],
      lastActive: Date.now(),
      state: { sharing: 'private', shared_with: [] }
    }
    yield put(createUserShellScene({ scene }))
    yield call(watchRefreshLocalScene, id)
    yield call(refreshCompositorScene, id)

    if (creationCallback) {
      yield call(creationCallback, { id })
    }

    yield take(action => (action.type === deleteUserShellScene) && (action.payload.sceneId === id))
    yield call(deleteCompositorScene, id)
    const newActiveScene = yield select(lastActiveSceneExcludingSelector, id)
    yield put(markSceneLastActive({ id: newActiveScene.id }))
  }
}

function * watchSceneCreation () {
  yield takeEvery(createScene, handleSceneLifecycle)
}

function * handleRequestSurfaceActive ({ payload: { key } }) {
  yield call(requestCompositorSurfaceActive, key)
}

function * watchRequestUserSurfaceActive () {
  yield takeLatest(requestSurfaceActive, handleRequestSurfaceActive)
}

function * handleDeleteClient ({ payload: { id } }) {
  yield call(deleteCompositorClient, id)
}

function * watchTerminateClient () {
  yield takeEvery(deleteClient, handleDeleteClient)
}

function * handleUpdateUserSeat ({ seat }) {
  yield put(updateUserShellSeat({ seat }))
}

function * watchUpdateUserSeat () {
  yield takeLatest(onUpdateUserShellSeat, handleUpdateUserSeat)
}

function * handleOnNotify ({ variant, message }) {
  yield put(showNotification({ variant, message }))
}

function * watchNotify () {
  yield takeEvery(onNotifyChannel, handleOnNotify)
}

function * handleCreateUserShellCompositor () {
  yield put(initializingUserShellCompositor())
  yield call(createCompositor)
  yield all([
    put(updateUserShellSeat({
      seat: {
        pointerGrab: null,
        keyboardFocus: null,
        keyboard: {
          nrmlvoEntries: [...compositorKeyboardNrmlvoEntries()],
          defaultNrmlvo: compositorKeyboardDefaultNrmlvo()
        }
      }
    })),
    put(createScene({ scene: { name: 'default', type: 'local' } }))
  ])
  yield put(initializedUserShellCompositor())
}

function * watchCreateUserShellCompositor () {
  yield take(createUserShellCompositor)
  yield call(handleCreateUserShellCompositor)
}

function * handleUpdateUserConfiguration ({ configuration }) {
  yield call(updateCompositorConfiguration, configuration)
}

function * watchUpdateUserConfiguration () {
  yield takeLatest(updateUserShellConfiguration, handleUpdateUserConfiguration)
}

export default function * rootSaga () {
  yield fork(watchLaunchWebApp)
  yield fork(watchLaunchRemoteApp)

  yield fork(watchUserSurfaceUpdate)
  yield fork(watchUserSurfaceViewCreation)
  yield fork(watchUserSurfaceCreation)
  yield fork(watchUserSurfaceDestruction)
  yield fork(watchRequestUserSurfaceActive)
  yield fork(watchActiveUserSurface)

  yield fork(watchClientCreation)
  yield fork(watchClientDestruction)

  yield fork(watchSceneCreation)
  yield fork(watchSceneMarkLastActive)

  yield fork(watchTerminateClient)

  yield fork(watchUpdateUserSeat)

  yield fork(watchNotify)

  yield fork(watchUpdateUserConfiguration)
  yield fork(watchCreateUserShellCompositor)
}
