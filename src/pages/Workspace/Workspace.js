import { useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router'
import React from 'react'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'

const Workspace = () => {
  const { sceneId } = useParams()
  // TODO use reselect
  const lastActiveSceneId = useSelector(({ compositor }) => {
    if (compositor.initialized) {
      return Object.values(compositor.scenes).reduce((previousValue, currentValue) => previousValue.lastActive > currentValue.lastActive ? previousValue : currentValue).id
    } else {
      return null
    }
  })
  if (lastActiveSceneId && sceneId == null) {
    return <Redirect to={`/workspace/${lastActiveSceneId}`} push />
  } else if (lastActiveSceneId) {
    return <Redirect to={`/workspace/${sceneId}`} push />
  } else {
    return <LoadingComponent />
  }
}

export default Workspace
