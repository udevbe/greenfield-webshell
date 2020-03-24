import {
  createScene,
  denySceneAccess,
  grantSceneAccess,
  initializeCompositor,
  markSceneLastActive,
  notifySceneAccessDenied,
  notifySceneAccessGrant,
  setRemoteSceneScaling
} from '../../store/compositor'
import { showNotification } from '../../store/notification'
import { uuidv4 } from './index'
import {
  handleSceneAccessRequest,
  refreshScene,
  remoteAxis,
  remoteButtonDown,
  remoteButtonUp,
  remoteKey,
  remotePointerMove,
  requestSceneAccess,
  sendRemoteSceneUpdate
} from './actions'

const importPeerModule = import('peerjs')

class SharedSceneMiddleWare {
  /**
   * @param {CompositorMiddleWare}compositorMiddleWare
   * @return {SharedSceneMiddleWare}
   */
  static create (compositorMiddleWare) {
    return new SharedSceneMiddleWare(compositorMiddleWare)
  }

  /**
   * @param {CompositorMiddleWare}compositorMiddleWare
   */
  constructor (compositorMiddleWare) {
    /**
     * @type {CompositorMiddleWare}
     * @private
     */
    this._compositorMiddleWare = compositorMiddleWare
    /**
     * @type {Object.<string,Peer.DataConnection>}
     * @private
     */
    this._dataConnections = {}
    /**
     * @type {Object.<string,MediaStream>}
     * @private
     */
    this._canvasMediaStreams = {}
    /**
     * @type {Peer}
     * @private
     */
    this._peer = null
  }

  /**
   * @param {string}peerId
   * @param {string}message
   * @param store
   * @private
   */
  _send (peerId, message, store) {
    const dataConnection = this._dataConnections[peerId]
    if (dataConnection && dataConnection.open) {
      console.log('sending message', message)
      dataConnection.send(message)
    } else if (dataConnection && !dataConnection.open) {
      dataConnection.on('open', () => dataConnection.send(message))
    } else if (!dataConnection) {
      // TODO refactor and reuse code from on('connection') event.
      const dataConnection = this._peer.connect(peerId, { reliable: true })
      this._dataConnections[peerId] = dataConnection
      dataConnection.on('close', () => delete this._dataConnections[dataConnection.peer])
      dataConnection.on('data', data => {
        // TODO we probably want a bit of message sanity checking here
        console.log('received data', data)
        const action = data
        action.payload.peerId = dataConnection.peer
        store.dispatch(action)
      })
      dataConnection.on('error', err => console.error(err))
      dataConnection.on('open', () => dataConnection.send(message))
    }
  }

  _installVideoInputHandlers (sceneElement, peerId, sceneId, store) {
    sceneElement.onpointermove = event => this._send(
      peerId,
      remotePointerMove(this._compositorMiddleWare.createButtonEventFromMouseEvent(event, null, sceneId)),
      store
    )
    sceneElement.onpointerdown = event => {
      sceneElement.setPointerCapture(event.pointerId)
      this._send(
        peerId,
        remoteButtonDown(this._compositorMiddleWare.createButtonEventFromMouseEvent(event, false, sceneId)),
        store
      )
    }
    sceneElement.onpointerup = event => {
      sceneElement.releasePointerCapture(event.pointerId)
      this._send(
        peerId,
        remoteButtonUp(this._compositorMiddleWare.createButtonEventFromMouseEvent(event, true, sceneId)),
        store
      )
    }
    sceneElement.onwheel = event => this._send(
      peerId,
      remoteAxis(this._compositorMiddleWare.createAxisEventFromWheelEvent(event, sceneId)),
      store
    )
    sceneElement.onkeydown = event => this._send(
      peerId,
      remoteKey(this._compositorMiddleWare.createKeyEventFromKeyboardEvent(event, true)),
      store
    )
    sceneElement.onkeyup = event => this._send(
      peerId,
      remoteKey(this._compositorMiddleWare.createKeyEventFromKeyboardEvent(event, false)),
      store
    )
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:undefined}}action
   * @return {*}
   */
  [initializeCompositor] (store, next, action) {
    const peerInit = importPeerModule.then(({ peerjs: { Peer } }) => {
      this._peer = new Peer(uuidv4(), { debug: 0 })
      action.payload = { ...action.payload, peerId: this._peer.id }
      this._peer.on('connection', dataConnection => {
        this._dataConnections[dataConnection.peer] = dataConnection
        dataConnection.on('close', () => delete this._dataConnections[dataConnection.peer])

        dataConnection.on('error', err => console.error(err))
        dataConnection.on('data', data => {
          console.log('received data', data)
          // TODO we probably want a bit of message sanity checking here
          const action = data
          action.payload.peerId = dataConnection.peer
          store.dispatch(action)
        })
      })

      this._peer.on('call', mediaConnection => {
        const { sceneId } = mediaConnection.metadata

        mediaConnection.on('stream', stream => {
          const video = /** @type {HTMLVideoElement} */document.getElementById(sceneId)
          this._installVideoInputHandlers(video, mediaConnection.peer, sceneId, store)
          video.srcObject = stream
          const updateScaling = () => {
            const { clientHeight, videoWidth, clientWidth, videoHeight } = video
            store.dispatch(setRemoteSceneScaling({
              sceneId,
              x: videoWidth / clientWidth,
              y: videoHeight / clientHeight
            }))
          }
          video.onloadedmetadata = () => {
            updateScaling()
            video.play().catch(reason => {
              console.error(reason)
              store.dispatch(showNotification({
                // TODO i18n
                message: `Failed to show remote scene: ${reason}`,
                variant: 'error'
              }))
            })
          }
          video.addEventListener('resize', updateScaling)
        })
        // TODO we probably only want to answer if the given sceneId is valid.
        mediaConnection.answer(null)
      })
    })

    peerInit.then(() => next(action))
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {name: string, id: string, type: string}}}action
   * @return {*}
   */
  [createScene] (store, next, action) {
    const { type } = action.payload

    let sceneElement = null
    if (type === 'remote') {
      const id = action.payload.id
      sceneElement = document.createElement('video')

      sceneElement.onmouseover = () => sceneElement.focus()
      sceneElement.tabIndex = 1

      sceneElement.style.display = 'none'
      sceneElement.id = id
      document.body.appendChild(sceneElement)
      next(action)
      store.dispatch(markSceneLastActive({ sceneId: id, lastActive: Date.now() }))
      return id
    } else {
      return next(action)
    }
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:string}}action
   * @return {*}
   */
  [refreshScene] (store, next, action) {
    const sceneId = action.payload
    const compositorState = store.getState().compositor
    const scene = compositorState.scenes[sceneId]

    if (scene.type === 'remote') {
      const video = /** @type {HTMLVideoElement} */document.getElementById(sceneId)
      const { clientHeight, videoWidth, clientWidth, videoHeight } = video
      store.dispatch(setRemoteSceneScaling({ sceneId, x: videoWidth / clientWidth, y: videoHeight / clientHeight }))
    }
    return next(action)
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload:{sceneId: string, peerId: string}}}action
   * @return {*}
   */
  [requestSceneAccess] (store, next, action) {
    const { sceneId, peerId } = action.payload
    const compositorState = store.getState().compositor

    const scene = compositorState.scenes[sceneId] || null
    if (!scene) {
      const firebaseState = store.getState().firebase
      store.dispatch(createScene({ name: 'remote', type: 'remote', id: sceneId }))
      next(action)
      const handleSceneAccessRequestAction = handleSceneAccessRequest({
        sceneId,
        requestingUserId: firebaseState.auth.uid
      })
      this._send(peerId, handleSceneAccessRequestAction, store)
    }
  }

  [sendRemoteSceneUpdate] (store, next, action) {
    const sceneId = action.payload
    const mediaStream = this._canvasMediaStreams[sceneId]
    if (mediaStream) {
      mediaStream.getVideoTracks()[0].requestFrame()
    }
  }

  /**
   * @param store
   * @param {function(action:*):*}next
   * @param {{payload: {sceneId: string, peerId: string}}}action
   * @return {*}
   */
  [handleSceneAccessRequest] (store, next, action) {
    const { sceneId, peerId, requestingUserId } = action.payload
    const firebaseState = store.getState().firebase
    const compositorState = store.getState().compositor

    const scene = compositorState.scenes[sceneId]
    if (scene && scene.type === 'local' && scene.state.sharing === 'public') {
      store.dispatch(grantSceneAccess({ sceneId, requestingUserId }))
      this._send(peerId, notifySceneAccessGrant({
        grantingUserId: firebaseState.auth.uid,
        sceneId
      }), store)

      const canvas = /** @type {HTMLCanvasElement} */ document.getElementById(sceneId)
      const sceneVideoStream = canvas.captureStream(0)
      this._canvasMediaStreams[sceneId] = sceneVideoStream
      const sceneCall = this._peer.call(peerId, sceneVideoStream, { metadata: { sceneId } })
      sceneCall.on('close', () => {
        action.payload.access = 'denied'
        next(action)
      })
      sceneCall.on('stream', () => store.dispatch(sendRemoteSceneUpdate(sceneId)))
    } else {
      store.dispatch(denySceneAccess({ sceneId, requestingUserId }))
      this._send(peerId, notifySceneAccessDenied({ sceneId }), store)
    }
    return next(action)
  }

  [remoteAxis] (store, next, action) {
    const event = action.payload
    this._compositorMiddleWare.session.userShell.actions.input.axis(event)
  }

  [remoteButtonDown] (store, next, action) {
    const event = action.payload
    this._compositorMiddleWare.session.userShell.actions.input.buttonDown(event)
  }

  [remoteButtonUp] (store, next, action) {
    const event = action.payload
    this._compositorMiddleWare.session.userShell.actions.input.buttonUp(event)
  }

  [remoteKey] (store, next, action) {
    const event = action.payload
    this._compositorMiddleWare.session.userShell.actions.input.key(event)
  }

  [remotePointerMove] (store, next, action) {
    const event = action.payload
    this._compositorMiddleWare.session.userShell.actions.input.pointerMove(event)
  }
}

export default SharedSceneMiddleWare
