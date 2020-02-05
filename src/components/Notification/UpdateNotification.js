import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Snackbar from '@material-ui/core/Snackbar'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

const UpdateNotification = React.memo(() => {
  const canUpdate = useSelector(({ serviceWorker }) => serviceWorker.canUpdate)
  const registration = useSelector(({ serviceWorker }) => serviceWorker.registrationUpdate)

  const [closed, setClosed] = useState(false)

  const doUpdate = () => {
    const registrationWaiting = registration.waiting

    registrationWaiting.addEventListener('statechange', e => {
      if (e.target.state === 'activated') {
        window.location.reload()
      }
    })
    registrationWaiting.postMessage({ type: 'SKIP_WAITING' })
  }

  const handleClose = () => { setClosed(true) }

  // TODO i18n
  return canUpdate ? (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      open={canUpdate && !closed}
      message='A new version is available.'
      action={
        <>
          <Button color='secondary' size='small' onClick={doUpdate}>Update</Button>
          <IconButton size='medium' aria-label='close' color='inherit' onClick={handleClose}>
            <CloseIcon fontSize='default' />
          </IconButton>
        </>
      }
    />
  ) : null
})

export default UpdateNotification
