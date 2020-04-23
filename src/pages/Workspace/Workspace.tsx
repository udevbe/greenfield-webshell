import { useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router'
import React from 'react'
import type { FunctionComponent } from 'react'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'
import type { UserShellScene } from '../../store/compositor'

const Workspace: FunctionComponent = () => {
  const { sceneId } = useParams()
  // TODO use reselect
  const lastActiveSceneId = useSelector((state) => {
    const compositor = state.compositor
    if (compositor.initialized) {
      return Object.values<UserShellScene>(
        compositor.scenes
      ).reduce((previousValue, currentValue) =>
        previousValue.lastActive > currentValue.lastActive
          ? previousValue
          : currentValue
      ).id
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

export default React.memo(Workspace)
