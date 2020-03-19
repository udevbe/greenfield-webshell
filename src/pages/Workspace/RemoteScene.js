import { Redirect, useParams } from 'react-router'
import React from 'react'
import { requestingSceneAccess } from '../../store/compositor'
import { useDispatch } from 'react-redux'

const RemoteScene = () => {
  const { sceneId, peerId } = useParams()
  const dispatch = useDispatch()

  dispatch(requestingSceneAccess({ sceneId, peerId }))

  return (
    <Redirect to={`/workspace/${sceneId}`} push />
  )
}

export default RemoteScene
