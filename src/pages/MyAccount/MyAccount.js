import Activity from '../../containers/Activity'
import QuestionDialog from '../../containers/QuestionDialog'
import { ImageCropDialog } from '../../containers/ImageCropDialog'
import { Delete, Error, Person, PhotoCamera, Save, VerifiedUser, Visibility, VisibilityOff } from '@material-ui/icons'
import {
  Avatar,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Switch
} from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { initializeMessaging } from '../../utils/messaging'
import { GoogleIcon } from '../../components/Icons'
import { useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { setDialogIsOpen } from '../../store/dialogs/actions'
import { setSimpleValue } from '../../store/simpleValues/actions'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { makeStyles } from '@material-ui/core/styles'
import { isLoaded, useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import moment from 'moment'
import { toast } from 'react-toastify'
import PermissionRequestToast from '../../components/Notifications/PermissionRequestToast'
import getSimpleValue from '../../store/simpleValues/selectors'
import getPersistentValue from '../../store/persistentValues/selectors'

const useStyles = makeStyles(theme => ({
  avatar: {
    margin: 10
  },
  bigAvatar: {
    width: 120,
    height: 120
  },
  margin: {
    margin: theme.spacing(1)
  },
  withoutLabel: {
    marginTop: theme.spacing(1) * 3
  }
}))

const MyAccount = () => {
  const appConfig = useAppConfig()
  const intl = useIntl()
  const dispatch = useDispatch()
  const firebase = useFirebase()
  const auth = useSelector(({ firebase: { auth } }) => auth)
  const database = useSelector(({ firebase: { database } }) => database)
  useFirebaseConnect({ path: '', storeAs: 'notificationTokens' })
  const notificationTokens = useSelector(state => state.firebase.ordered.notificationTokens)
  useFirebaseConnect({ path: '', storeAs: 'emailNotifications' })
  const emailNotifications = useSelector(state => state.firebase.ordered.emailNotifications)
  const newUserPhoto = useSelector(state => getSimpleValue(state, 'new_user_photo', false))
  const notificationPermissionRequested = useSelector(state => getPersistentValue(state, 'notificationPermissionRequested', false))
  const notificationPermissionShown = useSelector(state => getSimpleValue(state, 'notificationPermissionShown', false))

  const [values, setValues] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showConfirmPassword, setShowConfirmPassword] = useState(true)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)

  useFirebaseConnect([{ path: `notification_tokens/${auth.uid}`, storeAs: 'notificationTokens' }])
  useFirebaseConnect([{ path: `email_notifications/${auth.uid}`, storeAs: 'emailNotifications' }])

  useEffect(() => {
    const { displayName, email, photoURL } = auth
    setValues({ ...values, displayName, email, photoURL })
  })

  const getProviderIcon = p => { if (p === 'google.com') { return <GoogleIcon /> } else { return undefined } }
  const handleEmailVerificationsSend = () => auth.currentUser.sendEmailVerification().then(() => alert('Verification E-Mail send'))
  const handlePhotoUploadSuccess = snapshot => {
    snapshot.ref.getDownloadURL().then(downloadURL => {
      setValues({ ...values, photoURL: downloadURL })
      setIsPhotoDialogOpen(false)
    })
  }
  const handleValueChange = (name, value) => {
    setValues({ ...values, [name]: value })
    validate()
  }
  const getProvider = provider => {
    if (provider.indexOf('email') > -1) {
      return new auth.EmailAuthProvider()
    }
    if (provider.indexOf('anonymous') > -1) {
      return new auth.AnonymousAuthProvider()
    }
    if (provider.indexOf('google') > -1) {
      return new auth.GoogleAuthProvider()
    }

    throw new Error('Provider is not supported!')
  }
  const reauthenticateUser = (values, onSuccess) => {
    if (isLinkedWithProvider('password') && !values) {
      if (onSuccess && onSuccess instanceof Function) { onSuccess() }
    } else if (isLinkedWithProvider('password') && values) {
      const credential = auth.EmailAuthProvider.credential(auth.email, values.password)
      auth.currentUser.reauthenticateWithCredential(credential)
        .then(
          () => { if (onSuccess && onSuccess instanceof Function) { onSuccess() } },
          e => { /* TODO notify user of error */ }
        )
    } else {
      auth.currentUser.reauthenticateWithPopup(getProvider(auth.providerData[0].providerId))
        .then(
          () => { if (onSuccess && onSuccess instanceof Function) { onSuccess() } },
          e => { /* TODO notify user of error */ }
        )
    }
  }
  const isLinkedWithProvider = provider => {
    try {
      return (
        auth &&
        auth.providerData &&
        auth.providerData.find(p => p.providerId === provider) !== undefined
      )
    } catch (e) {
      return false
    }
  }

  const linkUserWithPopup = p => {
    const provider = getProvider(p)
    auth.currentUser.linkWithPopup(provider)
      .then(
        () => firebase.updateAuth(auth.currentUser),
        e => { /* TODO notify user of error */ }
      )
  }
  const clean = obj => {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key])
    return obj
  }
  const submit = () => {
    const simpleChange =
      (values.displayName && values.displayName.localeCompare(auth.displayName)) ||
      (values.photoURL && values.photoURL.localeCompare(auth.photoURL))

    const simpleValues = {
      displayName: values.displayName,
      photoURL: values.photoURL
    }

    // Change simple data
    if (simpleChange) {
      auth.currentUser.updateProfile(simpleValues).then(
        () => {
          database.ref(`users/${auth.uid}`).update(clean(simpleValues))
            .then(
              () => firebase.updateAuth(values),
              e => { /* TODO notify user of error */ }
            )
        },
        e => { /* TODO notify user of error */ }
      )
    }

    // Change email
    if (values.email && values.email.localeCompare(auth.email)) {
      reauthenticateUser(values, () => {
        auth.currentUser.updateEmail(values.email)
          .then(
            () => {
              database.ref(`users/${auth.uid}`).update({ email: values.email })
                .then(
                  () => firebase.updateEmail(values.email),
                  e => { /* TODO notify user of error */ }
                )
            },
            e => {
              /* TODO notify user of error */
              if (e.code === 'auth/requires-recent-login') {
                auth.signOut().then(() => setTimeout(() => alert('Please sign in again to change your email.'), 1))
              }
            }
          )
      })
    }
    // Change password
    if (values.newPassword) {
      reauthenticateUser(values, () => {
        auth.currentUser.updatePassword(values.newPassword)
          .then(
            () => auth.signOut(),
            e => {
              /* TODO notify user of error */
              if (e.code === 'auth/requires-recent-login') {
                auth.signOut().then(() => setTimeout(() => alert('Please sign in again to change your password.'), 1))
              }
            }
          )
      })
    }
    // We manage the data saving above
    return false
  }
  const handleClose = () => {
    dispatch(setSimpleValue('delete_user', false))
    dispatch(setDialogIsOpen('auth_menu', false))
  }
  const handleDelete = () => {
    reauthenticateUser(false, () => {
      auth.currentUser.delete()
        .then(
          () => handleClose(),
          e => {
            /* TODO notify user of error */
            if (e.code === 'auth/requires-recent-login') {
              auth.signOut().then(() => setTimeout(() => alert('Please sign in again to delete your account.'), 1))
            }
          }
        )
    })
  }
  const validate = () => {
    const providerId = auth.providerData[0].providerId
    const errors = {}

    if (!values.displayName) {
      errors.displayName = 'Required'
    }

    if (!values.email) {
      errors.email = 'Required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address'
    } else if (!values.password && providerId === 'password' && auth.email.localeCompare(values.email)) {
      errors.password = 'For email change enter your password'
    }

    if (values.newPassword) {
      if (values.newPassword.length < 6) {
        errors.newPassword = 'Password should be at least 6 characters'
      } else if (values.newPassword.localeCompare(values.confirmPassword)) {
        errors.newPassword = 'Must be equal'
        errors.confirmPassword = 'Must be equal'
      }

      if (!values.password) {
        errors.password = 'Required'
      }
    }

    setErrors(errors)
  }

  const canSave = () => {
    if (Object.keys(errors).length) { return false }

    if (values.displayName !== auth.displayName ||
      values.email !== auth.email ||
      values.photoURL !== auth.photoURL) {
      return true
    }

    return !!values.newPassword
  }

  const handleDisableNotifications = () => {
    database.ref(`disable_notifications/${auth.uid}`).set(true)
      .then(() => {
        database.ref(`notification_tokens/${auth.uid}`).remove()
          .then(() => dispatch(setSimpleValue('disable_notifications', false)))
      })
  }

  const requestNotificationPermission = () => {
    const reengagingHours = appConfig.notificationsReengagingHours ? appConfig.notificationsReengagingHours : 48
    const requestNotificationPermission = notificationPermissionRequested
      ? moment().diff(notificationPermissionRequested, 'hours') > reengagingHours
      : true

    if (
      'Notification' in window &&
      window.Notification.permission !== 'granted' &&
      auth.uid &&
      requestNotificationPermission &&
      !notificationPermissionShown
    ) {
      dispatch(setSimpleValue('notificationPermissionShown', true))
      toast.info(
        ({ closeToast }) => (
          <PermissionRequestToast
            {...{
              closeToast,
              initializeMessaging
            }} closeToast={closeToast} initializeMessaging={initializeMessaging}
          />
        ),
        {
          position: toast.POSITION.TOP_CENTER,
          autoClose: false,
          closeButton: false,
          closeOnClick: false
        }
      )
    }
  }

  const handleEnableNotificationsChange = e => {
    if (!e.target.checked) {
      dispatch(setSimpleValue('disable_notifications', true))
    } else {
      database.ref(`disable_notifications/${auth.uid}`).remove(() => {
        requestNotificationPermission()
        // eslint-disable-next-line no-self-assign
        window.location.href = window.location.href
      })
    }
  }

  const handleEmailNotification = e => database.ref(`email_notifications/${auth.uid}`).set(e.target.checked)

  const classes = useStyles()
  const showPasswords = isLinkedWithProvider('password')

  return (
    <Activity
      isLoading={!isLoaded(notificationTokens) || !isLoaded(emailNotifications)}
      iconStyleRight={{ width: '50%' }}
      appBarContent={
        <div style={{ display: 'flex' }}>
          {auth.uid && (
            <IconButton
              color='inherit'
              disabled={!canSave()}
              aria-label='open drawer'
              onClick={() => submit()}
            >
              <Save className='material-icons' />
            </IconButton>
          )}

          {auth.uid && (
            <IconButton
              color='inherit' aria-label='open drawer'
              onClick={() => dispatch(setSimpleValue('delete_user', true))}
            >
              <Delete className='material-icons' />
            </IconButton>
          )}
        </div>
      }
      title={intl.formatMessage({ id: 'my_account' })}
    >
      <div>
        {auth.uid && (
          <div style={{ margin: 15, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {values.photoURL && (
                <Avatar
                  alt={auth.displayName}
                  src={values.photoURL}
                  className={classNames(classes.avatar, classes.bigAvatar)}
                />
              )}
              {!values.photoURL && (
                <Avatar className={classNames(classes.avatar, classes.bigAvatar)}>
                  <Person style={{ fontSize: 60 }} />{' '}
                </Avatar>
              )}

              <IconButton
                color='primary'
                onClick={() => setIsPhotoDialogOpen(true)}
              >
                <PhotoCamera />
              </IconButton>

              <div>
                {appConfig.firebase_providers.map((p, i) => {
                  if (p !== 'email' && p !== 'password' && p !== 'phone') {
                    return (
                      <IconButton
                        key={i}
                        disabled={isLinkedWithProvider(p)}
                        color='primary'
                        onClick={() => linkUserWithPopup(p)}
                      >
                        {getProviderIcon(p)}
                      </IconButton>
                    )
                  } else {
                    return <div key={i} />
                  }
                })}
              </div>

              <div>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationTokens.length > 0}
                        onChange={handleEnableNotificationsChange}
                        value='pushNotifiction'
                      />
                    }
                    label={intl.formatMessage({ id: 'notifications' })}
                  />
                </FormGroup>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailNotifications === true}
                        onChange={handleEmailNotification}
                        value='emailNotifications'
                      />
                    }
                    label={intl.formatMessage({ id: 'email_notifications' })}
                  />
                </FormGroup>
              </div>
            </div>

            <div style={{ margin: 15, display: 'flex', flexDirection: 'column' }}>
              <FormControl
                className={classNames(classes.margin, classes.textField)}
                error={!!errors.displayName}
              >
                <InputLabel htmlFor='adornment-password'>{intl.formatMessage({ id: 'name_label' })}</InputLabel>
                <Input
                  id='displayName'
                  fullWidth
                  value={values.displayName}
                  placeholder={intl.formatMessage({ id: 'name_hint' })}
                  onChange={e => {
                    handleValueChange('displayName', e.target.value)
                  }}
                />
                {errors.displayName && (
                  <FormHelperText id='name-helper-text'>{errors.displayName}</FormHelperText>
                )}
              </FormControl>
              <FormControl
                className={classNames(classes.margin, classes.textField)}
                error={!!errors.email}
              >
                <InputLabel htmlFor='adornment-password'>{intl.formatMessage({ id: 'email' })}</InputLabel>
                <Input
                  // id="email"
                  label='Email'
                  autoComplete='off'
                  placeholder={intl.formatMessage({ id: 'email' })}
                  fullWidth
                  onChange={e => handleValueChange('email', e.target.value)}
                  value={values.email}
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label='Toggle password visibility'
                        onClick={auth.emailVerified === true ? undefined : handleEmailVerificationsSend}
                      >
                        {auth.emailVerified && <VerifiedUser color='primary' />}
                        {!auth.emailVerified && <Error color='secondary' />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {errors.email && (
                  <FormHelperText id='name-helper-text'>{errors.email}</FormHelperText>
                )}
              </FormControl>

              {showPasswords && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControl
                    className={classNames(classes.margin, classes.textField)}
                    error={!!errors.password}
                  >
                    <InputLabel htmlFor='adornment-password'>Password</InputLabel>
                    <Input
                      autoComplete='off'
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={e => handleValueChange('password', e.target.value)}
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            color='primary'
                            aria-label='Toggle password visibility'
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.password && (
                      <FormHelperText id='name-helper-text'>{errors.password}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl
                    className={classNames(classes.margin, classes.textField)}
                    error={!!errors.newPassword}
                  >
                    <InputLabel htmlFor='adornment-password'>{intl.formatMessage({ id: 'new_password' })}</InputLabel>
                    <Input
                      autoComplete='off'
                      type={showNewPassword ? 'text' : 'password'}
                      value={values.newPassword}
                      onChange={e => handleValueChange('newPassword', e.target.value)}
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            color='primary'
                            aria-label='Toggle password visibility'
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.newPassword && (
                      <FormHelperText id='name-helper-text'>{errors.newPassword}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl
                    className={classNames(classes.margin, classes.textField)}
                    error={!!errors.confirmPassword}
                  >
                    <InputLabel htmlFor='adornment-password'>
                      {intl.formatMessage({ id: 'confirm_password' })}
                    </InputLabel>
                    <Input
                      autoComplete='off'
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={values.confirmPassword}
                      onChange={e => handleValueChange('confirmPassword', e.target.value)}
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            color='primary'
                            aria-label='Toggle password visibility'
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.confirmPassword && (
                      <FormHelperText id='name-helper-text'>{errors.confirmPassword}</FormHelperText>
                    )}
                  </FormControl>
                </div>
              )}
            </div>
          </div>
        )}

        <QuestionDialog
          name='delete_user'
          handleAction={handleDelete}
          title={intl.formatMessage({ id: 'delete_account_dialog_title' })}
          message={intl.formatMessage({ id: 'delete_account_dialog_message' })}
          action={intl.formatMessage({ id: 'delete' })}
        />

        <QuestionDialog
          name='disable_notifications'
          handleAction={handleDisableNotifications}
          title={intl.formatMessage({ id: 'disable_notifications_dialog_title' })}
          message={intl.formatMessage({ id: 'disable_notifications_dialog_message' })}
          action={intl.formatMessage({ id: 'disable' })}
        />

        <ImageCropDialog
          path={`users/${auth.uid}`}
          fileName='photoURL'
          onUploadSuccess={s => handlePhotoUploadSuccess(s)}
          open={isPhotoDialogOpen}
          src={newUserPhoto}
          handleClose={() => setIsPhotoDialogOpen(false)}
          title={intl.formatMessage({ id: 'change_photo' })}
        />
      </div>
    </Activity>
  )
}

MyAccount.propTypes = {}

export default MyAccount
