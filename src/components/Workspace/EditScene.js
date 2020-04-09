import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogContentText from '@material-ui/core/DialogContentText'
import { useDispatch, useSelector } from 'react-redux'
import { updateScene } from '../../middleware/compositor/actions'

const EditScene = React.memo(({ open, handleClose, id }) => {
  const dispatch = useDispatch()
  const sceneName = useSelector(({ compositor }) => compositor.scenes[id].name)

  // TODO i18n
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
          onChange={e => dispatch(updateScene({ scene: { id, name: e.target.value } }))}
        />
      </DialogContent>
    </Dialog>
  )
})

export default EditScene
