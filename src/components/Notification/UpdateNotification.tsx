import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'
import CloseIcon from '@material-ui/icons/Close'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'

const UpdateNotification = () => {
  const canUpdate: boolean = useSelector(({ serviceWorker }) => serviceWorker.canUpdate)
  const registration: ServiceWorkerRegistration = useSelector(({ serviceWorker }) => serviceWorker.registrationUpdate)

  const [closed, setClosed] = useState(false)

  const doUpdate = () => {
    const registrationWaiting = registration.waiting

    registrationWaiting?.addEventListener('statechange', (e) => {
      // @ts-ignore
      if (e.target.state === 'activated') {
        window.location.reload()
      }
    })
    registrationWaiting?.postMessage({ type: 'SKIP_WAITING' })
  }

  const handleClose = () => {
    setClosed(true)
  }

  // TODO i18n
  return canUpdate ? (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      open={canUpdate && !closed}
      message="A new version is available."
      action={
        <>
          <Button color="secondary" size="small" onClick={doUpdate}>
            Refresh
          </Button>
          <IconButton size="medium" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="default" />
          </IconButton>
        </>
      }
    />
  ) : null
}

export default React.memo(UpdateNotification)
