import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import React from 'react'
import Slide from '@material-ui/core/Slide'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { compose } from 'redux'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { setSimpleValue } from '../../store/simpleValues/actions'

const Transition = props => <Slide direction='up' {...props} />

const DeleteDialog = ({ name, fullScreen, handleDelete }) => {
  const intl = useIntl()
  const isDialogOpen = useSelector(({ simpleValues }) => !!(simpleValues && simpleValues[deleteKey]))
  const deleteUid = useSelector(({ simpleValues }) => simpleValues ? simpleValues[deleteKey] : false)
  const deleteKey = `delete_${name}`

  const handleClose = () => setSimpleValue(deleteKey, undefined)

  if (!isDialogOpen) {
    return null
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      open={isDialogOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>{intl.formatMessage({ id: `delete_${name}_title` })}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          {intl.formatMessage({ id: `delete_${name}_message` })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          onClick={() => {
            handleDelete(handleClose, deleteUid)
          }}
          color='secondary'
        >
          {intl.formatMessage({ id: 'delete' })}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default compose(
  withMobileDialog()
)(DeleteDialog)
