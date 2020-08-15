import { PropTypes } from '@material-ui/core'
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
import getSimpleValue from '../../store/simpleValues/selectors'

const QuestionDialog: FunctionComponent<{
  name: string
  handleAction: (handleClose: () => void) => void
  fullScreen?: boolean
  title?: string
  message?: string
  action?: string
  cancelColor?: PropTypes.Color
  actionColor?: PropTypes.Color
}> = ({
  name,
  handleAction,
  fullScreen = false,
  title = '',
  message = '',
  action = '',
  cancelColor = 'default',
  actionColor = 'primary',
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const isDialogOpen = useSelector((state) => getSimpleValue(state.simpleValues, name, false))
  const handleClose = () =>
    dispatch(
      setSimpleValue({
        id: name,
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
      aria-labelledby="question-dialog-title"
      aria-describedby="question-dialog-description"
    >
      <DialogTitle id="question-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="question-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color={cancelColor}>
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button onClick={() => handleAction(handleClose)} color={actionColor}>
          {action}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default compose(withMobileDialog())(React.memo(QuestionDialog))
