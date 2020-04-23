import type { FunctionComponent } from 'react'
import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogContentText from '@material-ui/core/DialogContentText'
import { useDispatch, useSelector } from 'react-redux'
import { updateSceneName } from '../../middleware/compositor/actions'
import type { UserShellScene } from '../../store/compositor'

const EditScene: FunctionComponent<{
  open: boolean
  handleClose: () => void
  scene: Pick<UserShellScene, 'id'>
}> = ({ open, handleClose, scene }) => {
  const dispatch = useDispatch()
  const sceneName = useSelector(
    ({ compositor }): string => compositor.scenes[scene.id].name
  )

  // TODO i18n
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Update Scene</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To change this scene's name, please enter a new name here.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Scene Name"
          type="text"
          fullWidth
          value={sceneName}
          onChange={(e) =>
            dispatch(updateSceneName({ ...scene, name: e.target.value }))
          }
        />
      </DialogContent>
    </Dialog>
  )
}

export default React.memo(EditScene)
