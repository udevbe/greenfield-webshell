import type { AnyAction, PayloadAction } from '@reduxjs/toolkit'
import { push } from 'connected-react-router'
import { buffers, eventChannel, EventChannel } from 'redux-saga'
import { all, call, fork, put, race, select, take, takeEvery, takeLatest } from 'redux-saga/effects'
import type {
  UserShellClient,
  UserShellConfiguration,
  UserShellScene,
  UserShellSeat,
  UserShellSurface,
  UserShellSurfaceView,
} from '../../store/compositor'
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
  updateUserShellSurface,
} from '../../store/compositor'
import { showNotification } from '../../store/notification'
import {
  activateLastActiveScene,
  activateScene,
  createScene,
  createUserShellCompositor,
  deleteClient,
  deleteScene,
  launchRemoteAppAction,
  launchWebAppAction,
  markSceneLastActive,
  refreshScene, requestSurfaceActive,
  updateSceneName,
} from './actions'
import type { CompositorApiEventCallbacks, UserShellSurfaceKey } from './CompositorApi'
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
  refreshCompositorScene,
  requestCompositorSurfaceActive,
  updateCompositorConfiguration,
} from './CompositorApi'
import {
  userShellSceneByLastActive,
  userShellSceneByLastActiveExcludingId,
  userShellSurfaceKeyByKeyboardFocus,
  userShellSurfaceKeyByPointerGrab,
  userShellSurfacesByClientId,
  viewsByUserShellSurfaceKey,
} from './selectors'

function subscribeToCompositorApiEvent<Key extends keyof CompositorApiEventCallbacks>(
  eventName: Key
): EventChannel<Parameters<NonNullable<CompositorApiEventCallbacks[Key]>>[0]> {
  return eventChannel((emitter) => {
    compositorApi.events[eventName] = (event: Parameters<NonNullable<CompositorApiEventCallbacks[Key]>>[0]) =>
      emitter(event)
    return () => {
      compositorApi.events[eventName] = undefined
    }
  }, buffers.expanding(2))
}

const onNotify = subscribeToCompositorApiEvent('onNotify')
const onCreateApplicationClient = subscribeToCompositorApiEvent('onCreateUserShellClient')
const onDeleteUserShellClient = subscribeToCompositorApiEvent('onDeleteUserShellClient')
const onCreateUserShellSurface = subscribeToCompositorApiEvent('onCreateUserShellSurface')
const onUpdateUserShellSurface = subscribeToCompositorApiEvent('onUpdateUserShellSurface')
const onDeleteUserShellSurface = subscribeToCompositorApiEvent('onDeleteUserShellSurface')
const onUpdateUserShellSeat = subscribeToCompositorApiEvent('onUpdateUserShellSeat')

/**
 * @param {string} url
 * @param {string} title
 * @param {string} id
 * @return {Generator<*, void, ?>}
 */
function* handleLaunchRemoteApp({
  payload: {
    application: { url, title },
    id,
  },
}: {
  payload: {
    application: { url: string; title: string }
    id: string
  }
}) {
  try {
    yield call(launchRemoteApp, id, url)
  } catch (error) {
    yield put(
      showNotification({
        variant: 'error',
        message: `${title} failed to launch. ${error.message}`,
      })
    )
  }
}

function* handleLaunchWebApp({
  payload: {
    application: { title },
    downloadURL,
  },
}: {
  payload: {
    application: { title: string }
    downloadURL: string
  }
}) {
  try {
    yield call(launchWebApp, downloadURL)
  } catch (error) {
    // TODO A full list of error codes is available at https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
      case 'storage/object-not-found':
        yield put(
          showNotification({
            variant: 'error',
            message: `${title} application could not be found on server.`,
          })
        )
        break
      case 'storage/unauthorized':
        yield put(
          showNotification({
            variant: 'error',
            message: `Not authorized to launch ${title}.`,
          })
        )
        break
      case 'storage/unknown':
      default:
        yield put(
          showNotification({
            variant: 'error',
            message: `${title} failed to launch. ${error.message}`,
          })
        )
        break
    }
  }
}

function* watchLaunchWebApp() {
  yield takeEvery(launchWebAppAction, handleLaunchWebApp)
}

function* watchLaunchRemoteApp() {
  yield takeEvery(launchRemoteAppAction, handleLaunchRemoteApp)
}

function* handleUserSurfaceUpdate(surface: UserShellSurface) {
  if (surface.active) {
    surface.lastActive = Date.now()
  }
  yield put(updateUserShellSurface(surface))
}

function* watchUserSurfaceUpdate() {
  yield takeLatest(onUpdateUserShellSurface, handleUserSurfaceUpdate)
}

function filterDeleteUserShellSurfaceView(action: AnyAction, view: UserShellSurfaceView): boolean {
  if (action.type === deleteUserShellSurfaceView.type) {
    const userShellSurfaceView: UserShellSurfaceView = action.payload
    return userShellSurfaceView.sceneId === view.sceneId && userShellSurfaceView.surfaceKey === view.surfaceKey
  } else {
    return false
  }
}

function filterDeleteUserShellScene(action: AnyAction, scene: Pick<UserShellScene, 'id'>) {
  if (action.type === deleteUserShellScene.type) {
    const userShellScene: UserShellScene = action.payload
    return userShellScene.id === scene.id
  } else {
    return false
  }
}

function* handleUserSurfaceViewLifecycle({ payload: view }: PayloadAction<UserShellSurfaceView>) {
  yield call(createCompositorSurfaceView, view)

  const { sceneDestroyed } = yield race({
    surfaceViewDestroyed: take((action: AnyAction) => filterDeleteUserShellSurfaceView(action, view)),
    sceneDestroyed: take((action: AnyAction) => filterDeleteUserShellScene(action, { id: view.sceneId })),
  })

  if (sceneDestroyed) {
    yield put(deleteUserShellSurfaceView(view))
  }
}

function* watchUserSurfaceViewCreation() {
  yield takeEvery(createUserShellSurfaceView, handleUserSurfaceViewLifecycle)
}

function* destroyViewsFromSurface(surfaceKey: UserShellSurfaceKey) {
  const userSurfaceViews: UserShellSurfaceView[] = yield select(viewsByUserShellSurfaceKey, surfaceKey)
  yield all(userSurfaceViews.map((view) => put(deleteUserShellSurfaceView(view))))
}

function* removeUserSeatGrabsIfSurfaceMatches(surfaceKey: UserShellSurfaceKey) {
  const { pointerGrab: pointerGrabSurface, keyboardFocus: keyboardFocusSurface } = yield all({
    pointerGrab: select(userShellSurfaceKeyByPointerGrab),
    keyboardFocus: select(userShellSurfaceKeyByKeyboardFocus),
  })
  const seat = {
    pointerGrab: pointerGrabSurface,
    keyboardFocus: keyboardFocusSurface,
  }

  if (pointerGrabSurface && pointerGrabSurface === surfaceKey) {
    seat.pointerGrab = null
  }
  if (keyboardFocusSurface && keyboardFocusSurface === surfaceKey) {
    seat.keyboardFocus = null
  }
  yield put(updateUserShellSeat(seat))
}

function filterDeleteUserShellSurface(action: AnyAction, surface: UserShellSurface): boolean {
  if (action.type === deleteUserShellSurface.type) {
    const userShellSurface: Pick<UserShellSurface, 'key'> = action.payload
    return userShellSurface.key === surface.key
  } else {
    return false
  }
}

function* handleUserSurfaceLifecycle(surface: UserShellSurface) {
  const surfaceKey = surface.key
  yield put(createUserShellSurface(surface))
  const scene = yield select(userShellSceneByLastActive)
  const sceneId = scene.id
  const view = { surfaceKey, sceneId }
  yield put(createUserShellSurfaceView(view))

  yield take((action: AnyAction) => filterDeleteUserShellSurface(action, surface))

  yield all([call(destroyViewsFromSurface, surfaceKey), call(removeUserSeatGrabsIfSurfaceMatches, surfaceKey)])
}

function* watchUserSurfaceCreation() {
  yield takeEvery(onCreateUserShellSurface, handleUserSurfaceLifecycle)
}

function* handleDestroyUserSurface(key: UserShellSurfaceKey) {
  yield put(deleteUserShellSurface({ key }))
}

function* watchUserSurfaceDestruction() {
  yield takeEvery(onDeleteUserShellSurface, handleDestroyUserSurface)
}

function* handleOnCreateApplicationClientLifecycle(client: UserShellClient) {
  yield put(createUserShellClient(client))

  yield take((action: AnyAction) => action.type === deleteUserShellClient && action.payload.id === client.id)
  // TODO listen for user surface creation from client instead of using selector
  const userSurfaces: UserShellSurface[] = yield select(userShellSurfacesByClientId, client.id)
  yield all(userSurfaces.map((userSurface) => put(deleteUserShellSurface({ key: userSurface.key }))))
}

function* watchOnCreateApplicationClient() {
  yield takeEvery(onCreateApplicationClient, handleOnCreateApplicationClientLifecycle)
}

function* handleOnDeleteUserShellClient(client: Pick<UserShellClient, 'id'>) {
  yield put(deleteUserShellClient(client))
}

function* watchOnDeleteUserShellClient() {
  yield takeEvery(onDeleteUserShellClient, handleOnDeleteUserShellClient)
}

function* handleRefreshLocalScene(scene: Pick<UserShellScene, 'id'>) {
  yield call(refreshCompositorScene, scene)
}

function* watchRefresLocalScene(id: string) {
  yield takeLatest(
    (action: AnyAction) => action.type === refreshScene.type && action.payload.id === id,
    handleRefreshLocalScene,
    { id }
  )
}

function* handleMarkSceneLastActive({ payload: scene }: PayloadAction<Pick<UserShellScene, 'id'>>) {
  yield put(updateUserShellScene({ ...scene, lastActive: Date.now() }))
}

function* watchSceneMarkLastActive() {
  yield takeLatest(markSceneLastActive.type, handleMarkSceneLastActive)
}

function* handleCreateSceneLifecycle({
  payload: { type, name },
}: PayloadAction<Pick<UserShellScene, 'name' | 'type'>>) {
  if (type === 'local') {
    const id = yield call(createCompositorScene)
    const scene: UserShellScene = {
      id,
      type,
      name,
      views: [],
      lastActive: Date.now(),
      state: { sharing: 'private', sharedWith: [] },
    }
    yield put(createUserShellScene(scene))
    yield fork(watchRefresLocalScene, id)
    yield put(activateScene(scene))

    yield take((action: AnyAction) => action.type === deleteUserShellScene.type && action.payload.id === id)
    const newActiveScene = yield select(userShellSceneByLastActiveExcludingId, id)
    yield put(activateScene({ id: newActiveScene.id }))
    yield call(deleteCompositorScene, scene)
  }
}

function* watchCreateScene() {
  yield takeEvery(createScene, handleCreateSceneLifecycle)
}

function* handleActivateScene({ payload: scene }: PayloadAction<Pick<UserShellScene, 'id'>>) {
  yield put(markSceneLastActive(scene))
  yield put(push(`/workspace/${scene.id}`))
}

function* watchActivateScene() {
  yield takeLatest(activateScene, handleActivateScene)
}

function* handleDeleteScene({ payload: scene }: PayloadAction<Pick<UserShellScene, 'id'>>) {
  yield put(deleteUserShellScene(scene))
}

function* watchDeleteScene() {
  yield takeEvery(deleteScene, handleDeleteScene)
}

function* handleUpdateScene({ payload: scene }: PayloadAction<Pick<UserShellScene, 'id'> & Partial<UserShellScene>>) {
  yield put(updateUserShellScene(scene))
}

function* watchUpdateSceneName() {
  yield takeEvery(updateSceneName, handleUpdateScene)
}

function* handleRequestSurfaceActive({ payload: surface }: PayloadAction<Pick<UserShellSurface, 'key'>>) {
  yield call(requestCompositorSurfaceActive, surface)
}

function* watchRequestSurfaceActive() {
  yield takeLatest(requestSurfaceActive, handleRequestSurfaceActive)
}

function* handleDeleteClient({ payload: client }: PayloadAction<Pick<UserShellClient, 'id'>>) {
  yield call(deleteCompositorClient, client)
}

function* watchDeleteClient() {
  yield takeEvery(deleteClient, handleDeleteClient)
}

function* handleOnUpdateUserShellSeat(seat: Pick<UserShellSeat, 'keyboardFocus' | 'pointerGrab'>) {
  yield put(updateUserShellSeat(seat))
}

function* watchOnUpdateUserShellSeat() {
  yield takeLatest(onUpdateUserShellSeat, handleOnUpdateUserShellSeat)
}

function* handleOnNotify({ variant, message }: { variant: string; message: string }) {
  // @ts-ignore
  yield put(showNotification({ variant, message }))
}

function* watchOnNotify() {
  yield takeEvery(onNotify, handleOnNotify)
}

function* handleCreateUserShellCompositor() {
  yield put(initializingUserShellCompositor())
  yield call(createCompositor)
  yield all([
    put(
      updateUserShellSeat({
        keyboard: {
          nrmlvoEntries: [...compositorKeyboardNrmlvoEntries()],
          defaultNrmlvo: compositorKeyboardDefaultNrmlvo(),
        },
      })
    ),
    put(createScene({ name: 'default', type: 'local' })),
  ])
  yield put(initializedUserShellCompositor())
}

function* watchCreateUserShellCompositor() {
  yield take(createUserShellCompositor)
  yield call(handleCreateUserShellCompositor)
}

function* handleUpdateUserShellConfiguration({
  payload: configuration,
}: PayloadAction<Partial<UserShellConfiguration>>) {
  yield call(updateCompositorConfiguration, configuration)
}

function* watchUpdateUserShellConfiguration() {
  yield takeLatest(updateUserShellConfiguration, handleUpdateUserShellConfiguration)
}

function* handleActivateLastActiveScene() {
  const lastActiveScene = yield select(userShellSceneByLastActive)
  yield put(activateScene(lastActiveScene))
}

function* watchActivateLastActiveScene() {
  yield takeLatest(activateLastActiveScene, handleActivateLastActiveScene)
}

export default function* rootSaga() {
  yield fork(watchLaunchWebApp)
  yield fork(watchLaunchRemoteApp)

  yield fork(watchUserSurfaceUpdate)
  yield fork(watchUserSurfaceViewCreation)
  yield fork(watchUserSurfaceCreation)
  yield fork(watchUserSurfaceDestruction)
  yield fork(watchRequestSurfaceActive)

  yield fork(watchOnCreateApplicationClient)
  yield fork(watchOnDeleteUserShellClient)

  yield fork(watchCreateScene)
  yield fork(watchDeleteScene)
  yield fork(watchSceneMarkLastActive)
  yield fork(watchUpdateSceneName)
  yield fork(watchActivateScene)

  yield fork(watchDeleteClient)

  yield fork(watchOnUpdateUserShellSeat)

  yield fork(watchOnNotify)

  yield fork(watchUpdateUserShellConfiguration)
  yield fork(watchCreateUserShellCompositor)
  yield fork(watchActivateLastActiveScene)
}
