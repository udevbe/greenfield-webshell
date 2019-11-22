import AccountBox from '@material-ui/icons/AccountBox'
import Activity from '../../containers/Activity'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Delete from '@material-ui/icons/Delete'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import IconButton from '@material-ui/core/IconButton'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import Lock from '@material-ui/icons/Lock'
import React, { useEffect, useState } from 'react'
import RoleGrants from '../../containers/Roles/RoleGrants'
import Save from '@material-ui/icons/Save'
import Scrollbar from '../../components/Scrollbar/Scrollbar'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import classNames from 'classnames'
import { compose } from 'redux'
import { change, submit } from 'redux-form'
import { connect, useSelector } from 'react-redux'
import { injectIntl } from 'react-intl'
import { setDialogIsOpen } from '../../store/dialogs/actions'
import { withAppConfigs } from '../../contexts/AppConfigProvider'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { isLoaded, useFirebase, useFirebaseConnect } from 'react-redux-firebase'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default
  },
  tabs: {
    flex: 1,
    width: '100%'
  },
  form: {
    backgroundColor: theme.palette.background.default,
    margin: 15,
    display: 'flex',
    justifyContent: 'center'
  }
}))

export const Role = (props) => {
  const { intl, uid, history, dialogs, setDialogIsOpen, editType } = props
  const firebase = useFirebase()
  const firebaseApp = firebase.app

  const [values, setValues] = useState({ name: '', description: '' })
  const [errors, setErrors] = useState({})
  useEffect(() => { firebaseApp.database().ref(`roles/${uid}`).on('value', snap => setValues(snap.val() ? snap.val() : {})) })

  const clean = obj => {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key])
    return obj
  }

  const submit = () => firebaseApp.database().ref(`roles/${uid}`).update(clean(values)).then(() => history.push('/roles'))
  const handleTabActive = (e, value) => history.push(`/roles/edit/${uid}/${value}`)
  const handleValueChange = (name, value) => setValues({
    values: {
      ...values,
      [name]: value
    }
  }, () => validate())

  useFirebaseConnect([{ path: 'role_grants' }])
  const roleGrants = useSelector(state => state.firebase.ordered.role_grants)

  const handleClose = () => setDialogIsOpen('delete_role', false)

  const validate = () => {
    if (!values.name) {
      errors.displayName = 'Required'
    }
    setErrors({ errors })
  }

  const handleDelete = () => {
    if (uid) {
      firebaseApp.database().ref().child(`/roles/${uid}`).remove().then(() => {
        handleClose()
        history.goBack()
      })
    }
  }

  const canSave = () => !Object.keys(this.state.errors).length

  const classes = useStyles()

  return (
    <Activity
      isLoading={!isLoaded(roleGrants)}
      appBarContent={
        <div>
          {editType === 'main' && (
            <IconButton
              color='inherit'
              disabled={!canSave()}
              aria-label='open drawer'
              onClick={submit}
            >
              <Save className='material-icons' />
            </IconButton>
          )}

          {editType === 'main' && (
            <IconButton color='inherit' aria-label='open drawer' onClick={() => setDialogIsOpen('delete_role', true)}>
              <Delete className='material-icons' />
            </IconButton>
          )}
        </div>
      }
      onBackClick={() => history.push('/roles')}
      title={intl.formatMessage({ id: 'edit_role' })}
    >
      <Scrollbar style={{ height: '100%' }}>
        <div className={classes.root}>
          <AppBar position='static'>
            <Tabs value={editType} onChange={handleTabActive} fullWidth centered>
              <Tab value='main' icon={<AccountBox className='material-icons' />} />
              <Tab value='grants' icon={<Lock className='material-icons' />} />
            </Tabs>
          </AppBar>

          {editType === 'main' && (
            <div className={classes.form}>
              <div style={{ margin: 15, display: 'flex', flexDirection: 'column' }}>
                <FormControl
                  className={classNames(classes.margin, classes.textField)}
                  error={!!errors.name}
                >
                  <InputLabel htmlFor='adornment-password'>{intl.formatMessage({ id: 'name_label' })}</InputLabel>
                  <Input
                    id='name'
                    fullWidth
                    value={values.name}
                    placeholder={intl.formatMessage({ id: 'name_hint' })}
                    onChange={e => handleValueChange('name', e.target.value)}
                  />
                  {errors.displayName && (
                    <FormHelperText id='name-helper-text'>{errors.displayName}</FormHelperText>
                  )}
                </FormControl>
                <br />
                <FormControl className={classNames(classes.margin, classes.textField)}>
                  <InputLabel htmlFor='adornment-password'>
                    {intl.formatMessage({ id: 'description_label' })}
                  </InputLabel>
                  <Input
                    id='description'
                    fullWidth
                    multiline
                    value={values.description}
                    placeholder={intl.formatMessage({ id: 'description_hint' })}
                    onChange={e => {
                      handleValueChange('description', e.target.value)
                    }}
                  />
                </FormControl>
              </div>
            </div>
          )}
          {editType === 'grants' && isLoaded(roleGrants) && <RoleGrants {...props} roleGrants={roleGrants} />}
        </div>
      </Scrollbar>

      <Dialog
        open={dialogs.delete_role === true}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{intl.formatMessage({ id: 'delete_role_dialog_title' })}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {intl.formatMessage({ id: 'delete_role_dialog_message' })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
          <Button onClick={handleDelete} color='secondary'>
            {intl.formatMessage({ id: 'delete' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Activity>
  )
}

const mapStateToProps = (state, ownProps) => {
  const { intl, dialogs } = state

  const { match } = ownProps
  const editType = match.params.editType ? match.params.editType : 'data'
  const uid = match.params.uid ? match.params.uid : ''

  return {
    intl,
    uid,
    dialogs,
    editType
  }
}

export default compose(
  connect(
    mapStateToProps,
    { setDialogIsOpen, change, submit }
  ),
  injectIntl,
  withRouter,
  withAppConfigs
)(Role)
