import Activity from '../../containers/Activity'
import QuestionDialog from '../../containers/QuestionDialog'
import ImageCropDialog from '../../containers/ImageCropDialog/ImageCropDialog'

import Delete from '@material-ui/icons/Delete'
import Error from '@material-ui/icons/Error'
import Person from '@material-ui/icons/Person'
import PhotoCamera from '@material-ui/icons/PhotoCamera'
import Save from '@material-ui/icons/Save'
import VerifiedUser from '@material-ui/icons/VerifiedUser'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

import Avatar from '@material-ui/core/Avatar'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import IconButton from '@material-ui/core/IconButton'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import InputLabel from '@material-ui/core/InputLabel'

import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { GoogleIcon } from '../../components/Icons'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { setSimpleValue } from '../../store/simpleValues/actions'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { makeStyles } from '@material-ui/core/styles'
import { useFirebase } from 'react-redux-firebase'
import getSimpleValue from '../../store/simpleValues/selectors'

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

  const displayName = useSelector(({ firebase: { auth } }) => auth.displayName)
  const email = useSelector(({ firebase: { auth } }) => auth.email)
  const emailVerified = useSelector(({ firebase: { auth } }) => auth.emailVerified)
  const photoURL = useSelector(({ firebase: { auth } }) => auth.photoURL)
  const uid = useSelector(({ firebase: { auth } }) => auth.uid)
  const providerData = useSelector(({ firebase: { auth } }) => auth.providerData, shallowEqual)

  const newUserPhoto = useSelector(state => getSimpleValue(state, 'new_user_photo', false))

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

  useEffect(() => {
    setValues(values => ({ ...values, displayName, email, photoURL }))
  }, [displayName, email, photoURL])

  const getProviderIcon = p => { if (p === 'google.com') { return <GoogleIcon /> } else { return undefined } }
  const handleEmailVerificationsSend = () => firebase.firebase_.auth().currentUser.sendEmailVerification().then(() => alert('Verification E-Mail send'))
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
      return new firebase.firebase_.auth.EmailAuthProvider()
    }
    if (provider.indexOf('anonymous') > -1) {
      return new firebase.firebase_.auth.AnonymousAuthProvider()
    }
    if (provider.indexOf('google') > -1) {
      return new firebase.firebase_.auth.GoogleAuthProvider()
    }

    throw new Error('Provider is not supported!')
  }
  const reauthenticateUser = (values, onSuccess) => {
    if (isLinkedWithProvider('password') && !values) {
      if (onSuccess && onSuccess instanceof Function) { onSuccess() }
    } else if (isLinkedWithProvider('password') && values) {
      const credential = firebase.auth().EmailAuthProvider.credential(email, values.password)
      firebase.auth().currentUser.reauthenticateWithCredential(credential)
        .then(
          () => { if (onSuccess && onSuccess instanceof Function) { onSuccess() } },
          e => { /* TODO notify user of error */ }
        )
    } else {
      firebase.auth().currentUser.reauthenticateWithPopup(getProvider(providerData[0].providerId))
        .then(
          () => { if (onSuccess && onSuccess instanceof Function) { onSuccess() } },
          e => { /* TODO notify user of error */ }
        )
    }
  }
  const isLinkedWithProvider = provider => {
    try {
      return providerData.find(p => p.providerId === provider) !== undefined
    } catch (e) {
      return false
    }
  }

  const linkUserWithPopup = p => {
    const provider = getProvider(p)
    firebase.auth().currentUser.linkWithPopup(provider).then(
      () => firebase.firebase_.auth().currentUser.updateProfile(firebase.auth().currentUser),
      e => { /* TODO notify user of error */ }
    )
  }
  const clean = obj => {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key])
    return obj
  }
  const submit = () => {
    const simpleChange =
      (values.displayName && values.displayName.localeCompare(displayName)) ||
      (values.photoURL && values.photoURL.localeCompare(photoURL))

    const simpleValues = {
      displayName: values.displayName,
      photoURL: values.photoURL
    }

    // Change simple data
    if (simpleChange) {
      firebase.firebase_.auth().currentUser.updateProfile(simpleValues).then(
        () => {
          firebase.ref(`users/${uid}`).update(clean(simpleValues)).then(
            () => firebase.firebase_.auth().currentUser.updateProfile(values),
            e => { /* TODO notify user of error */ }
          )
        },
        e => { /* TODO notify user of error */ }
      )
    }

    // Change email
    if (values.email && values.email.localeCompare(email)) {
      reauthenticateUser(values, () => {
        firebase.firebase_.auth().currentUser.updateEmail(values.email).then(
          () => {
            firebase.ref(`users/${uid}`).update({ email: values.email })
              .then(
                () => firebase.firebase_.auth().currentUser.updateEmail(values.email),
                e => { /* TODO notify user of error */ }
              )
          },
          e => {
            /* TODO notify user of error */
            if (e.code === 'auth/requires-recent-login') {
              firebase.firebase_.auth().signOut().then(() => setTimeout(() => alert('Please sign in again to change your email.'), 1))
            }
          }
        )
      })
    }
    // Change password
    if (values.newPassword) {
      reauthenticateUser(values, () => {
        firebase.firebase_.auth().currentUser.updatePassword(values.newPassword).then(
          () => firebase.firebase_.auth().signOut(),
          e => {
            /* TODO notify user of error */
            if (e.code === 'auth/requires-recent-login') {
              firebase.auth().signOut().then(() => setTimeout(() => alert('Please sign in again to change your password.'), 1))
            }
          }
        )
      })
    }
    // We manage the data saving above
    return false
  }

  const handleDelete = async () => {
    try {
      await Promise.all([
        firebase.ref(`/users/${uid}`).remove(),
        firebase.ref(`/user_roles/${uid}`).remove()
      ])
      await firebase.firebase_.auth().currentUser.delete()
      window.location.reload()
    } catch (e) {
      /* TODO notify user of error */
      if (e.code === 'auth/requires-recent-login') {
        await firebase.firebase_.auth().signOut()
        // TODO show a nice popup
        alert('Please sign in again to delete your account.')
        window.location.reload()
      }
    }
  }
  const validate = () => {
    const providerId = providerData[0].providerId
    const errors = {}

    if (!values.displayName) {
      errors.displayName = 'Required'
    }

    if (!values.email) {
      errors.email = 'Required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address'
    } else if (!values.password && providerId === 'password' && email.localeCompare(values.email)) {
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

    if (values.displayName !== displayName ||
      values.email !== email ||
      values.photoURL !== photoURL) {
      return true
    }

    return !!values.newPassword
  }

  const handleDisableNotifications = () => {
    firebase.ref(`disable_notifications/${uid}`).set(true)
      .then(() => {
        firebase.ref(`notification_tokens/${uid}`).remove()
          .then(() => dispatch(setSimpleValue('disable_notifications', false)))
      })
  }

  const classes = useStyles()
  const showPasswords = isLinkedWithProvider('password')

  return (
    <Activity
      isLoading={false}
      iconStyleRight={{ width: '50%' }}
      appBarContent={
        <div style={{ display: 'flex' }}>
          {uid && (
            <IconButton
              color='inherit'
              disabled={!canSave()}
              aria-label='open drawer'
              onClick={() => submit()}
            >
              <Save className='material-icons' />
            </IconButton>
          )}

          {uid && (
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
        {uid && (
          <div style={{ margin: 15, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {values.photoURL && (
                <Avatar
                  alt={displayName}
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
                        onClick={emailVerified === true ? undefined : handleEmailVerificationsSend}
                      >
                        {emailVerified && <VerifiedUser color='primary' />}
                        {!emailVerified && <Error color='secondary' />}
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
          path={`users/${uid}`}
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
