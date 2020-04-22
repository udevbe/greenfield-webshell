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
import { useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { setSimpleValue } from '../../store/simpleValues/actions'
import getSimpleValue from '../../store/simpleValues/selectors'

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" {...props} ref={ref} />
))

const QuestionDialog = React.memo(
  ({
    name,
    handleAction,
    fullScreen,
    title = '',
    message = '',
    action = '',
    cancelColor = 'default',
    actionColor = 'primary',
  }) => {
    const intl = useIntl()
    const dispatch = useDispatch()
    const isDialogOpen = useSelector((state) =>
      getSimpleValue(state, name, false)
    )
    const handleClose = () => dispatch(setSimpleValue(name, undefined))

    if (!isDialogOpen) {
      return null
    }

    return (
      <Dialog
        fullScreen={fullScreen}
        open={isDialogOpen}
        onClose={handleClose}
        TransitionComponent={Transition}
        aria-labelledby="question-dialog-title"
        aria-describedby="question-dialog-description"
      >
        <DialogTitle id="question-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="question-dialog-description">
            {message}
          </DialogContentText>
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
)

QuestionDialog.propTypes = {}

export default compose(withMobileDialog())(QuestionDialog)
