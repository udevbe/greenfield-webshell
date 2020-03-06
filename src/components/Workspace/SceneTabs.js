import * as React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { makeStyles } from '@material-ui/styles'
import { useDispatch, useSelector } from 'react-redux'
import { Add } from '@material-ui/icons'
import Button from '@material-ui/core/Button'
import { createScene, makeSceneActive } from '../../store/compositor'

const useStyles = makeStyles(theme => ({
  sceneTabsContainer: {
    display: 'flex',
    order: 999,
    marginTop: 'auto'
  },
  sceneTabs: {
    flex: '1 0 auto'
  },
  tabIndicator: {
    height: 6,
    backgroundColor: theme.palette.primary.main
  }
}))

const SceneTabs = React.memo(() => {
  const dispatch = useDispatch()

  const addScene = () => dispatch(createScene({ name: 'new scene', type: 'local' }))
  const activateScene = (sceneId) => dispatch(makeSceneActive(sceneId))

  const scenes = useSelector(({ compositor }) => compositor.scenes)
  const activeSceneId = useSelector(({ compositor }) => compositor.activeSceneId)

  const classes = useStyles()
  return (
    <div className={classes.sceneTabsContainer}>
      <Tabs
        className={classes.sceneTabs}
        variant='standard'
        value={activeSceneId}
        classes={{
          indicator: classes.tabIndicator
        }}
      >
        {
          Object.entries(scenes).map(([sceneId, scene]) =>
            <Tab
              component='div'
              key={sceneId}
              value={sceneId}
              label={scene.name}
              onClick={() => activateScene(sceneId)}
            />)
        }
      </Tabs>
      <Button color='primary' aria-label='add' size='small' onClick={addScene}>
        <Add />
      </Button>
    </div>
  )
})

export default SceneTabs
