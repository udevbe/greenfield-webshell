import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import { Switch } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { shareScene } from '../../store/compositor'
import Typography from '@material-ui/core/Typography'

const ShareScene = ({ open, handleClose, sceneId }) => {
  const dispatch = useDispatch()
  const isPublic = useSelector(({ compositor }) => compositor.scenes[sceneId].state.sharing === 'public')
  const peerId = useSelector(({ compositor }) => compositor.peerId)

  const publicURL = `${window.location.protocol}//${window.location.host}/workspace/remote/${sceneId}/${peerId}`
  const publicURLStyle = {
    visibility: isPublic ? 'visible' : 'hidden',
    opacity: isPublic ? '1' : '0',
    transition: 'visibility 0.3s linear,opacity 0.3s linear'
  }

  // TODO i18n
  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
      <DialogTitle id='form-dialog-title'>Share Scene</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Toggle the button below to make this this scene publicly available to other users.
        </DialogContentText>
        <Switch
          checked={isPublic}
          onChange={event => dispatch(shareScene({
            sceneId,
            sharing: event.target.checked ? 'public' : 'private'
          }))}
          value='public'
          color='primary'
          inputProps={{ 'aria-label': 'Scene charing checkbox' }}
        />
        <Typography
          paragraph
          style={publicURLStyle}
        >
          {publicURL}
        </Typography>
      </DialogContent>
    </Dialog>
  )
}

export default ShareScene
