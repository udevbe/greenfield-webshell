import { useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router'
import React from 'react'

const Workspace = () => {
  const { sceneId } = useParams()
  const activeSceneId = useSelector(({ compositor }) => compositor.activeSceneId)
  if (sceneId == null) {
    return <Redirect to={`/workspace/${activeSceneId}`} />
  } else if (sceneId !== activeSceneId) {
    return <Redirect to={`/workspace/${sceneId}`} />
  } else {
    return <Redirect to={`/workspace/${activeSceneId}`} />
  }
}

export default Workspace
