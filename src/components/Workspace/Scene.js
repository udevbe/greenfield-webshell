import React, { useLayoutEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import SceneTabs from './SceneTabs'
import { makeStyles } from '@material-ui/styles'
import { refreshScene } from '../../middleware/compositor/actions'

const useStyles = makeStyles((theme) => ({
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

const configureSceneElement = (sceneElement) => {
  sceneElement.style.display = 'inline'
  sceneElement.style.width = '100%'
  sceneElement.style.overflow = 'hidden'
  sceneElement.style.flex = 1
  sceneElement.style.order = 100
  sceneElement.style.outline = 'none'
  sceneElement.style.objectFit = 'fill'
  sceneElement.style.backgroundColor = 'black'

  return sceneElement
}

const Scene = React.memo(({ id }) => {
  const dispatch = useDispatch()
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    if (id === null) {
      return
    }

    const contentElement = /** @type  {HTMLElement} */ contentRef.current
    const sceneElement = document.getElementById(id)
    const resizeListener = () => {
      dispatch(refreshScene({ id }))
    }

    if (sceneElement.parentElement !== contentElement) {
      configureSceneElement(sceneElement)
      contentElement.appendChild(sceneElement)
      dispatch(refreshScene({ id }))
      window.addEventListener('resize', resizeListener)
    }
    sceneElement.focus()

    return () => {
      window.removeEventListener('resize', resizeListener)
      sceneElement.style.display = 'none'
      document.body.appendChild(sceneElement)
    }
  }, [contentRef, dispatch, id])

  const classes = useStyles()
  return (
    <div className={classes.content} ref={contentRef}>
      <SceneTabs id={id} />
    </div>
  )
})

export default Scene
