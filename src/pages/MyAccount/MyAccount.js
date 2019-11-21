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
import React, { useState } from 'react'
import classNames from 'classnames'
import requestNotificationPermission from '../../utils/messaging'
import { GoogleIcon } from '../../components/Icons'
import { compose } from 'redux'
import { connect, useSelector } from 'react-redux'
import { injectIntl } from 'react-intl'
import { setDialogIsOpen } from '../../store/dialogs/actions'
import { setSimpleValue } from '../../store/simpleValues/actions'
import { withAppConfigs } from '../../contexts/AppConfigProvider'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { isLoaded, useFirebase, useFirebaseConnect } from 'react-redux-firebase'

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

const MyAccount = (props) => {
  const { auth, authError, authStateChanged, setSimpleValue, setDialogIsOpen, intl, appConfig, new_user_photo } = props

  useFirebaseConnect([{ path: `notification_tokens/${auth.uid}`, storeAs: 'notificationTokens' }])
  useFirebaseConnect([{ path: `email_notifications/${auth.uid}`, storeAs: 'emailNotifications' }])
  const notificationTokens = useSelector(state => state.firebase.ordered.notificationTokens)
  const emailNotifications = useSelector(state => state.firebase.ordered.emailNotifications)

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
  const firebase = useFirebase()
  const firebaseApp = firebase.app

  const getProviderIcon = p => { if (p === 'google.com') { return <GoogleIcon /> } else { return undefined } }
  const handleEmailVerificationsSend = () => firebaseApp.auth().currentUser.sendEmailVerification().then(() => alert('Verification E-Mail send'))
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
      return new firebase.auth.EmailAuthProvider()
    }
    if (provider.indexOf('anonymous') > -1) {
      return new firebase.auth.AnonymousAuthProvider()
    }
    if (provider.indexOf('google') > -1) {
      return new firebase.auth.GoogleAuthProvider()
    }

    throw new Error('Provider is not supported!')
  }
  const reauthenticateUser = (values, onSuccess) => {
    if (isLinkedWithProvider('password') && !values) {
      if (onSuccess && onSuccess instanceof Function) { onSuccess() }
    } else if (isLinkedWithProvider('password') && values) {
      const credential = firebase.auth.EmailAuthProvider.credential(auth.email, values.password)
      firebaseApp.auth().currentUser.reauthenticateWithCredential(credential)
        .then(
          () => { if (onSuccess && onSuccess instanceof Function) { onSuccess() } },
          e => authError(e)
        )
    } else {
      firebaseApp.auth().currentUser.reauthenticateWithPopup(getProvider(auth.providerData[0].providerId))
        .then(
          () => { if (onSuccess && onSuccess instanceof Function) { onSuccess() } },
          e => authError(e)
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
    firebaseApp.auth().currentUser.linkWithPopup(provider)
      .then(
        () => authStateChanged(firebaseApp.auth().currentUser),
        e => authError(e)
      )
  }
  const handleCreateValues = () => false
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
      firebaseApp.auth().currentUser.updateProfile(simpleValues).then(
        () => {
          firebaseApp.database().ref(`users/${auth.uid}`).update(clean(simpleValues))
            .then(
              () => authStateChanged(values),
              e => authError(e)
            )
        },
        e => authError(e)
      )
    }

    // Change email
    if (values.email && values.email.localeCompare(auth.email)) {
      reauthenticateUser(values, () => {
        firebaseApp.auth().currentUser.updateEmail(values.email)
          .then(
            () => {
              firebaseApp.database().ref(`users/${auth.uid}`).update({ email: values.email })
                .then(
                  () => authStateChanged({ email: values.email }),
                  e => authError(e)
                )
            },
            e => {
              authError(e)
              if (e.code === 'auth/requires-recent-login') {
                firebaseApp.auth().signOut().then(() => setTimeout(() => alert('Please sign in again to change your email.'), 1))
              }
            }
          )
      })
    }
    // Change password
    if (values.newPassword) {
      reauthenticateUser(values, () => {
        firebaseApp.auth().currentUser.updatePassword(values.newPassword)
          .then(
            () => firebaseApp.auth().signOut(),
            e => {
              authError(e)
              if (e.code === 'auth/requires-recent-login') {
                firebaseApp.auth().signOut().then(() => setTimeout(() => alert('Please sign in again to change your password.'), 1))
              }
            }
          )
      })
    }
    // We manage the data saving above
    return false
  }
  const handleClose = () => {
    setSimpleValue('delete_user', false)
    setDialogIsOpen('auth_menu', false)
  }
  const handleDelete = () => {
    reauthenticateUser(false, () => {
      firebaseApp.auth().currentUser.delete()
        .then(
          () => handleClose(),
          e => {
            authError(e)
            if (e.code === 'auth/requires-recent-login') {
              firebaseApp.auth().signOut().then(() => {
                setTimeout(() => alert('Please sign in again to delete your account.'), 1)
              })
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

  componentDidMount()
  {
    const { auth, watchList, watchPath } = this.props
    const { displayName, email, photoURL } = auth

    watchList(`notification_tokens/${auth.uid}`)
    watchPath(`email_notifications/${auth.uid}`)
    setValues({ ...values, displayName, email, photoURL })
  }

  const handleDisableNotifications = () => {
    firebaseApp.database().ref(`disable_notifications/${auth.uid}`).set(true)
      .then(() => {
        firebaseApp.database().ref(`notification_tokens/${auth.uid}`).remove()
          .then(() => setSimpleValue('disable_notifications', false))
      })
  }

  const handleEnableNotificationsChange = e => {
    if (!e.target.checked) {
      setSimpleValue('disable_notifications', true)
    } else {
      firebaseApp.database().ref(`disable_notifications/${auth.uid}`).remove(() => {
        requestNotificationPermission(props)
        // eslint-disable-next-line no-self-assign
        window.location.href = window.location.href
      })
    }
  }

  const handleEmailNotification = e => firebaseApp.database().ref(`email_notifications/${auth.uid}`).set(e.target.checked)

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
            <IconButton color='inherit' aria-label='open drawer' onClick={() => setSimpleValue('delete_user', true)}>
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
                        onClick={() => {
                          linkUserWithPopup(p)
                        }}
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
          src={new_user_photo}
          handleClose={() => setIsPhotoDialogOpen(false)}
          title={intl.formatMessage({ id: 'change_photo' })}
        />
      </div>
    </Activity>
  )
}

MyAccount.propTypes = {}

const mapStateToProps = state => {
  const { intl, simpleValues: { new_user_photo }, auth, messaging } = state

  return {
    new_user_photo,
    intl,
    auth,
    messaging
  }
}

export default compose(
  connect(
    mapStateToProps,
    { setSimpleValue, setDialogIsOpen }
  ),
  injectIntl,
  withRouter,
  withAppConfigs
)(MyAccount)
