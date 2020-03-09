import React, { useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import { useDispatch, useSelector } from 'react-redux'
import { updateScene } from '../../store/compositor'

// TODO i18n
const EditScene = React.memo(({ open, handleClose }) => {
  const dispatch = useDispatch()
  const activeScene = useSelector(({ compositor }) => {
    const activeSceneId = compositor.activeSceneId
    return compositor.scenes[activeSceneId]
  })

  const [sceneName, setSceneName] = useState(activeScene.name)

  const handleUpdate = () => {
    dispatch(updateScene({ ...activeScene, name: sceneName }))
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
      <DialogTitle id='form-dialog-title'>Update Scene</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To change this scene's name, please enter a new name here.
        </DialogContentText>
        <TextField
          autoFocus
          margin='dense'
          id='name'
          label='Scene Name'
          type='text'
          fullWidth
          value={sceneName}
          onChange={e => setSceneName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          Cancel
        </Button>
        <Button onClick={handleUpdate} color='primary'>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default EditScene
