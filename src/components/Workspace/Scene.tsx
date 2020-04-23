import { makeStyles } from '@material-ui/core/styles'
import type { FunctionComponent } from 'react'
import React, { useLayoutEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { refreshScene } from '../../middleware/compositor/actions'
import type { UserShellScene } from '../../store/compositor'
import SceneTabs from './SceneTabs'

const useStyles = makeStyles(() => ({
  content: {
    height: '100%',
    width: '100%',
    position: 'relative',
    float: 'left',
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexGrow: 1,
    overflow: 'hidden',
    backgroundColor: '#43464B',
  },
}))

const configureSceneElement = (sceneElement: HTMLElement): void => {
  sceneElement.style.display = 'inline'
  sceneElement.style.width = '100%'
  sceneElement.style.overflow = 'hidden'
  sceneElement.style.flex = '1'
  sceneElement.style.order = '100'
  sceneElement.style.outline = 'none'
  sceneElement.style.objectFit = 'fill'
  sceneElement.style.backgroundColor = 'black'
}

const Scene: FunctionComponent<{ scene: Pick<UserShellScene, 'id'> }> = ({
  scene,
}) => {
  const dispatch = useDispatch()
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (scene === null) {
      return
    }

    const contentElement = contentRef.current
    if (contentElement === null) {
      return
    }

    const sceneElement = document.getElementById(scene.id)
    if (sceneElement === null) {
      throw new Error('BUG? No HTMLELement found for scene id.')
    }
    const resizeListener = () => {
      dispatch(refreshScene(scene))
    }

    if (sceneElement.parentElement !== contentElement) {
      configureSceneElement(sceneElement)
      contentElement.appendChild(sceneElement)
      dispatch(refreshScene(scene))
      window.addEventListener('resize', resizeListener)
    }
    sceneElement.focus()

    return () => {
      window.removeEventListener('resize', resizeListener)
      sceneElement.style.display = 'none'
      document.body.appendChild(sceneElement)
    }
  }, [contentRef, dispatch, scene])

  const classes = useStyles()
  return (
    <div className={classes.content} ref={contentRef}>
      <SceneTabs scene={scene} />
    </div>
  )
}

export default React.memo(Scene)
