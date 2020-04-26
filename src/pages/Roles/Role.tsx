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
import type { FunctionComponent } from 'react'
import React, { useEffect, useState } from 'react'
import RoleGrants from '../../containers/Roles/RoleGrants'
import Save from '@material-ui/icons/Save'
import Scrollbar from '../../components/Scrollbar/Scrollbar'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import { useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { updateDialog } from '../../store/dialogs'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { isLoaded, useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { goBack, push } from 'connected-react-router'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
  },
  tabs: {
    flex: 1,
    width: '100%',
  },
  form: {
    backgroundColor: theme.palette.background.default,
    margin: 15,
    display: 'flex',
    justifyContent: 'center',
  },
}))

const emptyValues = { name: '', description: '' }

// TODO use redux-form?
export const Role: FunctionComponent = () => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const params = useParams<{ editType: string; uid: string }>()
  const editType = params?.editType ?? 'data'
  const uid = params?.uid ?? ''
  const dialogDeleteRole = useSelector((state) => state.dialogs.delete_role)
  const firebase = useFirebase()

  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!values.name || values.name === '') {
      setErrors((errors) => ({ ...errors, displayName: 'Required' }))
    } else {
      setErrors((errors) => {
        const { displayName, ...noDisplayNameErrors } = errors
        return noDisplayNameErrors
      })
    }
  }, [values.name])

  useFirebaseConnect([{ path: `roles/${uid}` }])
  const role = useSelector(({ firebase }) =>
    firebase.data.roles ? firebase.data.roles[uid] || emptyValues : emptyValues
  )
  useEffect(() => setValues(role), [role])

  const clean = (obj: { [key: string]: string }) => {
    Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key])
    return obj
  }

  const submit = () =>
    firebase
      .ref(`roles/${uid}`)
      .update(clean(values))
      .then(() => dispatch(push('/roles')))
  const handleTabActive = (_: any, value: string) =>
    dispatch(push(`/roles/edit/${uid}/${value}`))
  const handleValueChange = (name: string, value: string) =>
    setValues({ ...values, [name]: value })

  useFirebaseConnect([{ path: 'role_grants' }])
  const roleGrants = useSelector((state) => state.firebase.ordered.role_grants)

  const handleClose = () =>
    dispatch(updateDialog({ id: 'delete_role', open: false }))

  const handleDelete = () => {
    if (uid) {
      Promise.all([
        firebase.ref().child(`/role_grants/${uid}`).remove(),
        firebase.ref().child(`/roles/${uid}`).remove(),
      ]).then(() => {
        handleClose()
        dispatch(goBack())
      })
    }
  }

  const canSave = () => !Object.keys(errors).length

  const classes = useStyles()

  return (
    <Activity
      isLoading={!role || !isLoaded(roleGrants)}
      appBarContent={
        <div>
          {editType === 'main' && (
            <IconButton
              color="inherit"
              disabled={!canSave()}
              aria-label="open drawer"
              onClick={submit}
            >
              <Save className="material-icons" />
            </IconButton>
          )}

          {editType === 'main' && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() =>
                dispatch(updateDialog({ id: 'delete_role', open: true }))
              }
            >
              <Delete className="material-icons" />
            </IconButton>
          )}
        </div>
      }
      onBackClick={() => dispatch(push('/roles'))}
      appBarTitle={intl.formatMessage({ id: 'edit_role' })}
      pageTitle={intl.formatMessage({ id: 'edit_role' })}
    >
      <Scrollbar style={{ height: '100%' }}>
        <div className={classes.root}>
          <AppBar position="static">
            <Tabs
              value={editType}
              onChange={handleTabActive}
              centered
              variant={'fullWidth'}
            >
              <Tab
                value="main"
                icon={<AccountBox className="material-icons" />}
              />
              <Tab value="grants" icon={<Lock className="material-icons" />} />
            </Tabs>
          </AppBar>

          {editType === 'main' && (
            <div className={classes.form}>
              <div
                style={{
                  margin: 15,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <FormControl error={!!errors.name}>
                  <InputLabel htmlFor="name">
                    {intl.formatMessage({
                      id: 'name_label',
                    })}
                  </InputLabel>
                  <Input
                    id="name"
                    fullWidth
                    value={values.name}
                    placeholder={intl.formatMessage({
                      id: 'name_hint',
                    })}
                    onChange={(e) => handleValueChange('name', e.target.value)}
                  />
                  {errors.displayName && (
                    <FormHelperText id="name-helper-text">
                      {errors.displayName}
                    </FormHelperText>
                  )}
                </FormControl>
                <br />
                <FormControl>
                  <InputLabel htmlFor="description">
                    {intl.formatMessage({
                      id: 'description_label',
                    })}
                  </InputLabel>
                  <Input
                    id="description"
                    fullWidth
                    multiline
                    value={values.description}
                    placeholder={intl.formatMessage({
                      id: 'description_hint',
                    })}
                    onChange={(e) =>
                      handleValueChange('description', e.target.value)
                    }
                  />
                </FormControl>
              </div>
            </div>
          )}
          {editType === 'grants' && isLoaded(roleGrants) && (
            <RoleGrants roleGrants={roleGrants} />
          )}
        </div>
      </Scrollbar>

      <Dialog
        open={dialogDeleteRole}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {intl.formatMessage({ id: 'delete_role_dialog_title' })}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {intl.formatMessage({
              id: 'delete_role_dialog_message',
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
          <Button onClick={handleDelete} color="secondary">
            {intl.formatMessage({ id: 'delete' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Activity>
  )
}

export default React.memo(Role)
