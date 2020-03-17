import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import { Switch } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { shareScene } from '../../store/compositor'

const ShareScene = ({ open, handleClose, sceneId }) => {
  const dispatch = useDispatch()
  const scene = useSelector(({ compositor }) => compositor.scenes[sceneId])

  // TODO i18n
  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
      <DialogTitle id='form-dialog-title'>Share Scene</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Toggle the button below to make this this scene available to other users.
        </DialogContentText>
        <Switch
          checked={scene.state.sharing === 'public'}
          onChange={event => dispatch(shareScene({
            sceneId: scene.id,
            sharing: event.target.checked ? 'public' : 'private'
          }))}
          value='public'
          color='primary'
          inputProps={{ 'aria-label': 'Scene charing checkbox' }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default ShareScene
