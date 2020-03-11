import { useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router'
import React from 'react'

const Workspace = () => {
  const { sceneId } = useParams()
  // TODO use reselect
  const lastActiveSceneId = useSelector(({ compositor }) => Object.values(compositor.scenes).reduce((previousValue, currentValue) => previousValue.lastActive > currentValue.lastActive ? previousValue : currentValue).id)
  if (sceneId == null) {
    return <Redirect to={`/workspace/${lastActiveSceneId}`} push />
  } else {
    return <Redirect to={`/workspace/${sceneId}`} push />
  }
}

export default Workspace
