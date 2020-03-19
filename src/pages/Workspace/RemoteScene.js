import { Redirect, useParams } from 'react-router'
import React, { useState } from 'react'
import { requestingSceneAccess } from '../../store/compositor'
import { useDispatch } from 'react-redux'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import { Button, DialogActions } from '@material-ui/core'

const RemoteScene = () => {
  const { sceneId, peerId } = useParams()
  const dispatch = useDispatch()

  const [confirmation, setConfirmation] = useState(false)
  const [openScene, setOpenScene] = useState(false)

  if (confirmation) {
    if (openScene) {
      dispatch(requestingSceneAccess({ sceneId, peerId }))
      return <Redirect to={`/workspace/${sceneId}`} push />
    } else {
      return <Redirect to='/' push />
    }
  } else {
    return (
      <Dialog aria-labelledby='open-remote-scene-dialog-title' open>
        <DialogTitle id='open-remote-scene-dialog-title'>Open Remote Scene?</DialogTitle>
        <DialogActions>
          <Button onClick={() => {
            setConfirmation(true)
            setOpenScene(true)
          }}
          >
            Open
          </Button>
          <Button onClick={() => {
            setConfirmation(true)
            setOpenScene(false)
          }}
          >Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default RemoteScene
