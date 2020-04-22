// import type types.Eve from '@redux-saga/core'
import { PayloadAction } from '@reduxjs/toolkit'
import type { AxisEvent, ButtonEvent, KeyEvent } from 'compositor-module'
import type { DataConnection } from 'peerjs'
import Peer from 'peerjs'
import { actionTypes } from 'react-redux-firebase'
import type { AnyAction } from 'redux'
import type { EventChannel } from 'redux-saga'
import { eventChannel } from 'redux-saga'
import {
  all,
  call,
  cancel,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects'
import {
  createPeer,
  createUserShellScene,
  deleteUserShellScene,
  setRemoteSceneScaling,
  updateUserShellScene,
} from '../../store/compositor'
import { showNotification } from '../../store/notification'
import {
  activateScene,
  createScene,
  createUserShellCompositor,
  makeScenePrivate,
  makeScenePublic,
  refreshScene,
  remoteAxis,
  remoteButtonDown,
  remoteButtonUp,
  remoteKey,
  remotePointerMove,
  requestSceneAccess,
  sceneAccessDenied,
  sceneAccessGranted,
  sceneAccessRequest,
  sendRemoteSceneUpdate,
} from './actions'
import {
  axis,
  buttonDown,
  buttonUp,
  createAxisEventFromWheelEvent,
  createButtonEventFromMouseEvent,
  createKeyEventFromKeyboardEvent,
  key,
  pointerMove,
  uuidv4,
} from './CompositorApi'
import {
  userShellSceneById,
  userShellSceneByLastActiveExcludingId,
} from './selectors'

function createDataConnectionDataEventChannel(dataConnection: DataConnection) {
  return eventChannel<any>((emitter) => {
    dataConnection.on('data', (data) => emitter(data))
    return () => {
      dataConnection.on('data', () => {})
    }
  })
}

function createOnPointerMoveEventChannel(
  element: HTMLElement
): EventChannel<PointerEvent> {
  return eventChannel<PointerEvent>((emitter) => {
    element.onpointermove = (event) => emitter(event)
    return () => {
      element.onpointermove = null
    }
  })
}

function createOnPointerDownEventChannel(
  element: HTMLElement
): EventChannel<PointerEvent> {
  return eventChannel<PointerEvent>((emitter) => {
    element.onpointerdown = (event) => emitter(event)
    return () => {
      element.onpointerdown = null
    }
  })
}

function createOnPointerUpEventChannel(
  element: HTMLElement
): EventChannel<PointerEvent> {
  return eventChannel<PointerEvent>((emitter) => {
    element.onpointerup = (event) => emitter(event)
    return () => {
      element.onpointerup = null
    }
  })
}

function createOnWheelEventChannel(
  element: HTMLElement
): EventChannel<WheelEvent> {
  return eventChannel<WheelEvent>((emitter) => {
    element.onwheel = (event) => emitter(event)
    return () => {
      element.onwheel = null
    }
  })
}

function createOnKeyDownEventChannel(
  element: HTMLElement
): EventChannel<KeyboardEvent> {
  return eventChannel<KeyboardEvent>((emitter) => {
    element.onkeydown = (event) => emitter(event)
    return () => {
      element.onkeydown = null
    }
  })
}

function createOnKeyUpEventChannel(
  element: HTMLElement
): EventChannel<KeyboardEvent> {
  return eventChannel<KeyboardEvent>((emitter) => {
    element.onkeyup = (event) => emitter(event)
    return () => {
      element.onkeyup = null
    }
  })
}

const dataConnections: {
  [key: string]: { dataConnection: DataConnection }
} = {}
const canvasMediaStreams: { [key: string]: MediaStream } = {}

let peer: Peer

function* onDataConnectionData(
  data: Record<string, any>,
  dataConnection: DataConnection
) {
  // TODO do some basic validation on the data (data should be a redux action, limit what actions are allowed etc.)

  const action: AnyAction = {
    ...data,
    type: data.type,
    peer: { id: dataConnection.peer },
  }
  yield put(action)
}

function* watchDataConnectionData(
  dataConnection: DataConnection,
  onDataEventChannel: EventChannel<any>
) {
  yield takeEvery(onDataEventChannel, onDataConnectionData, dataConnection)
}

function* handleDataConnectionLifeCycle(dataConnection: DataConnection) {
  // TODO better error handling
  dataConnection.on('error', (err) => console.error(err))

  const dataConnectionDataChannel = createDataConnectionDataEventChannel(
    dataConnection
  )
  dataConnections[dataConnection.peer] = { dataConnection }
  yield fork(watchDataConnectionData, dataConnection, dataConnectionDataChannel)

  yield call(waitForDataConnectionClosed, dataConnection)
  dataConnectionDataChannel.close()
  delete dataConnections[dataConnection.peer]
}

async function waitForDataConnectionOpen(
  dataConnection: DataConnection
): Promise<void> {
  return new Promise((resolve) => {
    if (dataConnection.open) {
      resolve()
    } else {
      dataConnection.on('open', () => resolve())
    }
  })
}

function waitForDataConnectionClosed(dataConnection: DataConnection) {
  // TODO check for closed state?
  return new Promise((resolve) => dataConnection.on('close', () => resolve()))
}

function* send(peerId: string, message: string) {
  const dataConnection = dataConnections[peerId].dataConnection
  if (dataConnection) {
    yield call(waitForDataConnectionOpen, dataConnection)
    dataConnection.send(message)
  } else {
    const dataConnection = peer.connect(peerId, { reliable: true })
    yield fork(handleDataConnectionLifeCycle, dataConnection)
    yield call(waitForDataConnectionOpen, dataConnection)
    dataConnection.send(message)
  }
}

function* handleRemotePointerMove({
  payload: event,
}: PayloadAction<ButtonEvent>) {
  yield call(pointerMove, event)
}

function* watchRemotePointerMove() {
  yield takeEvery(remotePointerMove, handleRemotePointerMove)
}

function* handleRemoteButtonDown({
  payload: event,
}: PayloadAction<ButtonEvent>) {
  yield call(buttonDown, event)
}

function* watchRemoteButtonDown() {
  yield takeEvery(remoteButtonDown, handleRemoteButtonDown)
}

function* handleRemoteButtonUp({ payload: event }: PayloadAction<ButtonEvent>) {
  yield call(buttonUp, event)
}

function* watchRemoteButtonUp() {
  yield takeEvery(remoteButtonUp, handleRemoteButtonUp)
}

function* handleRemoteAxis({ payload: event }: PayloadAction<AxisEvent>) {
  yield call(axis, event)
}

function* watchRemoteAxis() {
  yield takeEvery(remoteAxis, handleRemoteAxis)
}

function* handleRemoteKey({ payload: event }: PayloadAction<KeyEvent>) {
  yield call(key, event)
}

function* watchRemoteKey() {
  yield takeEvery(remoteKey, handleRemoteKey)
}

function* handlePointerMoveEvent(
  event: PointerEvent,
  peerId: string,
  sceneId: string
) {
  const pointerMoveEvent = yield call(
    createButtonEventFromMouseEvent,
    event,
    null,
    sceneId
  )
  const pointerMoveAction = yield call(remotePointerMove, pointerMoveEvent)
  yield call(send, peerId, pointerMoveAction)
}

function* watchPointerMoveEvents(
  pointerMoveEventChannel: EventChannel<PointerEvent>,
  peerId: string,
  sceneId: string
) {
  // @ts-ignore redux-saga TS doesn't like mixed function argument types here.
  yield takeEvery(
    pointerMoveEventChannel,
    handlePointerMoveEvent,
    peerId,
    sceneId
  )
}

function* handleButtonDownEvent(
  event: PointerEvent,
  peerId: string,
  sceneId: string
) {
  event.preventDefault()
  event.currentTarget.setPointerCapture(event.pointerId)
  const buttonDownEvent = yield call(
    createButtonEventFromMouseEvent,
    event,
    false,
    sceneId
  )
  const buttonDownAction = yield call(remoteButtonDown, {
    event: buttonDownEvent,
  })
  yield call(send, peerId, buttonDownAction)
}

function* watchButtonDownEvents(
  pointerDownEventChannel: EventChannel<PointerEvent>,
  peerId: string,
  sceneId: string
) {
  takeEvery(pointerDownEventChannel, handleButtonDownEvent, peerId, sceneId)
}

function* handleButtonUpEvent(
  event: PointerEvent,
  peerId: string,
  sceneId: string
) {
  event.preventDefault()
  const buttonUpEvent = yield call(
    createButtonEventFromMouseEvent,
    event,
    true,
    sceneId
  )
  const buttonUpAction = yield call(remoteButtonUp, {
    event: buttonUpEvent,
  })
  yield call(send, peerId, buttonUpAction)
  event.currentTarget.releasePointerCapture(event.pointerId)
}

function* watchButtonUpEvents(
  pointerUpEventChannel: EventChannel<PointerEvent>,
  peerId: string,
  sceneId: string
) {
  takeEvery(pointerUpEventChannel, handleButtonUpEvent, peerId, sceneId)
}

function* handleWheelEvent(event, peerId: string, sceneId: string) {
  event.preventDefault()
  const axisEvent = yield call(createAxisEventFromWheelEvent, event, sceneId)
  const axisAction = yield call(remoteAxis, { event: axisEvent })
  yield call(send, peerId, axisAction)
}

function* watchWheelEvents(wheelEventChannel, peerId, sceneId) {
  takeEvery(wheelEventChannel, handleWheelEvent, peerId, sceneId)
}

function* handleKeyDownEvent(event, peerId) {
  event.preventDefault()
  const keyboardEvent = yield call(createKeyEventFromKeyboardEvent, event, true)
  const keyboardAction = yield call(remoteKey, { event: keyboardEvent })
  yield call(send, peerId, keyboardAction)
}

function* watchKeyDownEvents(keyDownEventChannel, peerId) {
  takeEvery(keyDownEventChannel, handleKeyDownEvent, peerId)
}

function* handleKeyUpEvent(event, peerId) {
  event.preventDefault()
  const keyboardEvent = yield call(
    createKeyEventFromKeyboardEvent,
    event,
    false
  )
  const keyboardAction = yield call(remoteKey, { event: keyboardEvent })
  yield call(send, peerId, keyboardAction)
}

function* watchKeyUpEvents(keyUpEventChannel, peerId) {
  takeEvery(keyUpEventChannel, handleKeyUpEvent, peerId)
}

function* installVideoInputHandlers(sceneElement, peerId, sceneId) {
  const pointerMoveEventChannel = createInputEventChannel(
    sceneElement,
    'onpointermove'
  )
  const pointerDownEventChannel = createInputEventChannel(
    sceneElement,
    'onpointerdown'
  )
  const pointerUpEventChannel = createInputEventChannel(
    sceneElement,
    'onpointerup'
  )
  const wheelEventChannel = createInputEventChannel(sceneElement, 'onwheel')
  const keyDownEventChannel = createInputEventChannel(sceneElement, 'onkeydown')
  const keyUpEventChannel = createInputEventChannel(sceneElement, 'onkeyup')

  yield all([
    call(watchPointerMoveEvents, pointerMoveEventChannel, peerId, sceneId),
    call(watchButtonDownEvents, pointerDownEventChannel, peerId, sceneId),
    call(watchButtonUpEvents, pointerUpEventChannel, peerId, sceneId),
    call(watchWheelEvents, wheelEventChannel, peerId, sceneId),
    call(watchKeyDownEvents, keyDownEventChannel, peerId),
    call(watchKeyUpEvents, keyUpEventChannel, peerId),
  ])
}

function* watchNewDataConnections(peer) {
  const newDataConnectionEventChannel = eventChannel((emitter) => {
    peer.on('connection', (dataConnection) => emitter(dataConnection))
    return () => {
      peer.on('connection', null)
    }
  })
  takeEvery(newDataConnectionEventChannel, handleDataConnectionLifeCycle)
}

function* handleRemoteSceneScaling(video, sceneId) {
  const { clientHeight, videoWidth, clientWidth, videoHeight } = video
  yield put(
    setRemoteSceneScaling({
      sceneId,
      x: videoWidth / clientWidth,
      y: videoHeight / clientHeight,
    })
  )
}

async function waitForLoadedMetaData(video) {
  return new Promise((resolve) => {
    video.onloaedmetadata = () => {
      resolve()
    }
  })
}

function* handleVideoResize(event, video, sceneId) {
  yield call(handleRemoteSceneScaling, video, sceneId)
}

function* watchVideoResize(video, sceneId) {
  const videoResizeEventChannel = eventChannel((emitter) => {
    const emitEvent = (event) => emitter(event)
    video.addEventListener('resize', emitEvent)
    return () => {
      video.removeEventListener('resize', emitEvent)
    }
  })
  takeEvery(videoResizeEventChannel, handleVideoResize, video, sceneId)
}

async function play(video) {
  return video.play()
}

function* handleNewStream(stream, sceneId, peerId) {
  const video = /** @type {HTMLVideoElement} */ document.getElementById(sceneId)
  yield call(installVideoInputHandlers, video, peerId, sceneId)
  video.srcObject = stream

  yield fork(watchVideoResize, video, sceneId)

  yield call(waitForLoadedMetaData, video)
  yield call(handleRemoteSceneScaling, video, sceneId)

  try {
    yield call(play, video)
  } catch (e) {
    console.error(e)
    yield put(
      showNotification({
        // TODO i18n
        message: `Failed to show remote scene: ${e}`,
        variant: 'error',
      })
    )
  }
}

async function waitForMediaConnectionClosed(mediaConnection) {
  return new Promise((resolve) => mediaConnection.on('close', () => resolve()))
}

function* handleMediaConnectionLifeCycle(mediaConnection) {
  const {
    peer: peerId,
    metadata: { sceneId },
  } = mediaConnection

  const newStreamEventChannel = eventChannel((emitter) => {
    mediaConnection.on('stream', (stream) => emitter(stream))
    return () => {
      mediaConnection.on('stream', null)
    }
  })
  const handleNewStreamTask = takeEvery(
    newStreamEventChannel,
    handleNewStream,
    sceneId,
    peerId
  )

  // TODO we probably only want to answer if the given sceneId is valid.
  mediaConnection.answer(null)

  yield call(waitForMediaConnectionClosed, mediaConnection)
  newStreamEventChannel.close()
  yield cancel(handleNewStreamTask)
}

function* watchNewMediaConnections(peer) {
  const newMediaConnectionEventChannel = eventChannel((emitter) => {
    peer.on('call', (mediaConnection) => emitter(mediaConnection))
    return () => {
      peer.on('call', null)
    }
  })
  takeEvery(newMediaConnectionEventChannel, handleMediaConnectionLifeCycle)
}

function* handleCreateUserShellCompositor() {
  const {
    peerjs: { Peer },
  } = yield call(() => importPeerModule)
  const id = uuidv4()
  const production = process.env.NODE_ENV === 'production'
  peer = new Peer(id, {
    debug: production ? 0 : 3,
    secure: production,
  })
  yield all([
    call(watchNewDataConnections, peer),
    call(watchNewMediaConnections, peer),
  ])
  yield put(createPeer({ peer: { id } }))
}

function* watchCreateUserShellCompositor() {
  yield take(createUserShellCompositor)
  yield call(handleCreateUserShellCompositor)
}

function* handleRefreshRemoteScene(id) {
  const video = /** @type {HTMLVideoElement} */ document.getElementById(id)
  const { clientHeight, videoWidth, clientWidth, videoHeight } = video
  yield put(
    setRemoteSceneScaling({
      id,
      x: videoWidth / clientWidth,
      y: videoHeight / clientHeight,
    })
  )
}

function* watchRefreshRemoteScene(id) {
  yield takeLatest(
    (action) => action.type === `${refreshScene}` && action.payload.id === id,
    handleRefreshRemoteScene,
    id
  )
}

function* handleSceneLifecycle({
  payload: {
    scene: { type, name, id },
  },
}) {
  if (type === 'remote') {
    const sceneElement = document.createElement('video')

    sceneElement.onmouseover = () => sceneElement.focus()
    sceneElement.tabIndex = 1

    sceneElement.style.display = 'none'
    sceneElement.id = id
    document.body.appendChild(sceneElement)

    const scene = {
      id,
      type,
      name,
      views: [],
      lastActive: Date.now(),
      state: {
        shared_by: '',
        access: 'pending',
        scaling: { x: 1, y: 1 },
      },
    }
    yield put(createUserShellScene({ scene }))
    // TODO cleanup fork task if our remote scene is deleted
    yield fork(watchRefreshRemoteScene, id)
    yield put(activateScene({ scene: { id } }))

    yield take(
      (action) =>
        action.type === `${deleteUserShellScene}` &&
        action.payload.scene.id === id
    )
    const newActiveScene = yield select(
      userShellSceneByLastActiveExcludingId,
      id
    )
    yield put(activateScene({ scene: { id: newActiveScene.id } }))
  }
}

function* watchSceneCreation() {
  yield takeEvery(createScene, handleSceneLifecycle)
}

function* handleRequestSceneAccess(
  {
    payload: {
      scene: { id: sceneId },
      peer: { id: peerId },
    },
  },
  { user: { id: userId } }
) {
  yield put(createScene, { name: 'remote', type: 'remote', id: sceneId })
  yield call(
    send,
    peerId,
    sceneAccessRequest({
      scene: { id: sceneId },
      user: { id: userId },
    })
  )
}

function* watchRequestSceneAccess() {
  while (true) {
    const {
      auth: { uid },
    } = yield take(actionTypes.LOGIN)
    const handleRequestSceneAccessTask = yield takeEvery(
      requestSceneAccess,
      handleRequestSceneAccess,
      {
        user: { id: uid },
      }
    )
    yield take(actionTypes.LOGOUT)
    yield cancel(handleRequestSceneAccessTask)
  }
}

function* handleSendRemoteSceneUpdate({
  payload: {
    scene: { id },
  },
}) {
  const mediaStream = canvasMediaStreams[id]
  if (mediaStream) {
    mediaStream.getVideoTracks()[0].requestFrame()
  }
}

function* watchSendRemoteSceneUpdate() {
  takeEvery(sendRemoteSceneUpdate, handleSendRemoteSceneUpdate)
}

async function* waitForStream(call) {
  return new Promise((resolve) => call.on('stream', () => resolve()))
}

function* handleSceneAccessGranted({
  payload: {
    scene: { id, state },
  },
}) {
  yield put(
    updateUserShellScene({
      scene: {
        id,
        state: {
          ...state,
          access: 'granted',
        },
      },
    })
  )
}

function* watchSceneAccessGranted() {
  yield takeEvery(sceneAccessGranted, handleSceneAccessGranted)
}

function* handleSceneAccessDenied({
  payload: {
    scene: { id, state },
  },
}) {
  yield put(
    updateUserShellScene({
      scene: {
        id,
        state: {
          ...state,
          access: 'denied',
        },
      },
    })
  )
}

function* watchSceneAccessDenied() {
  yield takeEvery(sceneAccessDenied, handleSceneAccessDenied)
}

function* localSceneAccessGranted(
  scene,
  requestingUserId,
  sceneId,
  peerId,
  ownUserId
) {
  const sharedWith = [...scene.state.sharedWith, requestingUserId]
  yield put(
    updateUserShellScene({
      scene: {
        id: sceneId,
        state: { sharedWith },
      },
    })
  )
  yield call(
    send,
    peerId,
    sceneAccessGranted({
      scene: {
        id: sceneId,
        state: {
          sharedWith,
          sharedBy: ownUserId,
        },
      },
    })
  )
  // TODO send updated sharedWith state to other connected users

  const canvas = /** @type {HTMLCanvasElement} */ document.getElementById(
    sceneId
  )
  const sceneVideoStream = canvas.captureStream(0)
  canvasMediaStreams[sceneId] = sceneVideoStream
  const sceneCall = peer.call(peerId, sceneVideoStream, {
    metadata: { sceneId },
  })
  // TODO how to handle sceneCall close?
  // sceneCall.on('close', () => {
  //   action.payload.access = 'denied'
  // })
  yield call(waitForStream, sceneCall)
  yield put(sendRemoteSceneUpdate({ scene: { id: sceneId } }))
}

function* localSceneAccessDenied(peerId, sceneId) {
  yield call(send, peerId, sceneAccessDenied({ scene: { id: sceneId } }))
}

function* handleSceneAccessRequest(
  {
    payload: {
      scene: { id: sceneId },
      peer: { id: peerId },
      user: { id: requestingUserId },
    },
  },
  { user: { id: ownUserId } }
) {
  const scene = yield select(userShellSceneById, sceneId)
  if (scene && scene.type === 'local' && scene.state.sharing === 'public') {
    yield call(
      localSceneAccessGranted,
      scene,
      requestingUserId,
      sceneId,
      peerId,
      ownUserId
    )
  } else {
    yield call(localSceneAccessDenied, peerId, sceneId)
  }
}

function* watchSceneAccessRequest() {
  while (true) {
    const {
      auth: { uid },
    } = yield take(actionTypes.LOGIN)
    const handleRemoteSceneAccessRequestTask = takeEvery(
      sceneAccessRequest,
      handleSceneAccessRequest,
      {
        user: { id: uid },
      }
    )
    yield take(actionTypes.LOGOUT)
    yield cancel(handleRemoteSceneAccessRequestTask)
  }
}

function* handleMakeScenePublic({
  payload: {
    scene: { id },
  },
}) {
  yield put(
    updateUserShellScene({
      scene: {
        id,
        state: { sharing: 'public' },
      },
    })
  )
}

function* watchMakeScenePublic() {
  yield takeEvery(makeScenePublic, handleMakeScenePublic)
}

function* handleMakeScenePrivate({
  payload: {
    scene: { id },
  },
}) {
  yield put(
    updateUserShellScene({
      scene: {
        id,
        state: { sharing: 'private' },
      },
    })
  )
  // TODO disconnect & cleanup any connections
}

function* watchMakeScenePrivate() {
  yield takeEvery(makeScenePrivate, handleMakeScenePrivate)
}

export default function* rootSaga() {
  yield fork(watchRemotePointerMove)
  yield fork(watchRemoteButtonDown)
  yield fork(watchRemoteButtonUp)
  yield fork(watchRemoteAxis)
  yield fork(watchRemoteKey)
  yield fork(watchCreateUserShellCompositor)
  yield fork(watchSceneCreation)
  yield fork(watchRequestSceneAccess)
  yield fork(watchSendRemoteSceneUpdate)
  yield fork(watchSceneAccessRequest)
  yield fork(watchMakeScenePublic)
  yield fork(watchMakeScenePrivate)
  yield fork(watchSceneAccessGranted)
  yield fork(watchSceneAccessDenied)
}
