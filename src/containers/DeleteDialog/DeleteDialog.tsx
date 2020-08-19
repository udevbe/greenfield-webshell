import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import React, { FunctionComponent } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { compose } from 'redux'
import { setSimpleValue } from '../../store/simpleValues'

const DeleteDialog: FunctionComponent<{
  name: string
  fullScreen: boolean
  handleDelete: (handleClose: () => void, deleteUid: string) => void
}> = ({ name, fullScreen, handleDelete }) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const isDialogOpen = useSelector((store) => !!(store.simpleValues && store.simpleValues[deleteKey]))
  const deleteUid = useSelector((store) => (store.simpleValues ? store.simpleValues[deleteKey] : false))
  const deleteKey = `delete_${name}`

  const handleClose = () =>
    dispatch(
      setSimpleValue({
        id: deleteKey,
        value: undefined,
      })
    )

  if (!isDialogOpen) {
    return null
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      open={isDialogOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{intl.formatMessage({ id: `delete_${name}_title` })}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {intl.formatMessage({ id: `delete_${name}_message` })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          onClick={() => {
            handleDelete(handleClose, deleteUid)
          }}
          color="secondary"
        >
          {intl.formatMessage({ id: 'delete' })}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default compose(withMobileDialog())(DeleteDialog)
