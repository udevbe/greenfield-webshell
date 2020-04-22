import Activity from '../../containers/Activity'

import Delete from '@material-ui/icons/Delete'
import Error from '@material-ui/icons/Error'
import Person from '@material-ui/icons/Person'
import PhotoCamera from '@material-ui/icons/PhotoCamera'
import Save from '@material-ui/icons/Save'
import VerifiedUser from '@material-ui/icons/VerifiedUser'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import Visibility from '@material-ui/icons/Visibility'

import Avatar from '@material-ui/core/Avatar'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import IconButton from '@material-ui/core/IconButton'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import InputLabel from '@material-ui/core/InputLabel'

import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { setSimpleValue } from '../../store/simpleValues/actions'
import { makeStyles } from '@material-ui/core/styles'
import { useFirebase } from 'react-redux-firebase'
import getSimpleValue from '../../store/simpleValues/selectors'
import { useUserId, useUserIsAnonymous } from '../../utils/auth'
import { useUserProp, useUserPropLoading } from '../../utils/userData'
import ImageCropDialog from '../../containers/ImageCropDialog/ImageCropDialog'
import QuestionDialog from '../../containers/QuestionDialog'
import { useNotifyError, useNotifyInfo } from '../../utils/notify'

const useStyles = makeStyles((theme) => ({
  avatar: {
    margin: 10,
  },
  bigAvatar: {
    width: 120,
    height: 120,
  },
  margin: {
    margin: theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(1) * 3,
  },
}))

// TODO use react redux forms and cleanup this mess.
const MyAccount = React.memo(() => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const firebase = useFirebase()
  const uid = useUserId()
  const isAnonymous = useUserIsAnonymous()

  const notifyError = useNotifyError()
  const notifyInfo = useNotifyInfo()

  const displayName = useUserProp(uid, 'displayName')
  const photoURL = useUserProp(uid, 'photoURL')
  const providerData = useUserProp(uid, 'providerData', shallowEqual)
  const isLinkedWithPasswordProvider =
    providerData && !!providerData.find((p) => p.providerId === 'password')

  const displayNameLoading = useUserPropLoading(uid, 'displayName')
  const photoURLLoading = useUserPropLoading(uid, 'photoURL')
  const providerDataLoading = useUserPropLoading(uid, 'providerData')

  const userPropsLoading =
    displayNameLoading || photoURLLoading || providerDataLoading

  const email = useSelector(({ firebase: { auth } }) => auth.email)
  const emailVerified = useSelector(
    ({ firebase: { auth } }) => auth.emailVerified
  )

  const newUserPhoto = useSelector((state) =>
    getSimpleValue(state, 'new_user_photo', false)
  )

  const [values, setValues] = useState({
    displayName,
    email,
    photoURL,
    emailVerified,
  })
  const [showConfirmPasswordValue, setShowConfirmPasswordValue] = useState(
    false
  )
  const [showNewPasswordValue, setShowNewPasswordValue] = useState(false)
  const [showPasswordValue, setShowPasswordValue] = useState(false)
  const [errors, setErrors] = useState({})
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)

  useEffect(() => {
    setValues((values) => ({
      ...values,
      displayName,
      email,
      photoURL,
      emailVerified,
    }))
  }, [displayName, email, photoURL, emailVerified])

  // TODO use nice popup
  const handleEmailVerificationsSend = async () => {
    try {
      await firebase.firebase_.auth().currentUser.sendEmailVerification()
      // There's no firebase event that tells us if an email is verified, so we have to resort to polling :'(
      let poller = 0
      poller = setInterval(() => {
        if (poller && emailVerified) {
          clearInterval(poller)
          poller = 0
        } else if (!emailVerified) {
          firebase.reloadAuth()
        }
      }, 3000)
    } catch (e) {
      // TODO error in sentry.io
      // TODO intl
      notifyError('Could not send E-Mail. Try again later.')
      throw e
    }
    // TODO intl
    notifyInfo('Verification E-Mail send')
  }
  const handlePhotoUploadSuccess = async (snapshot) => {
    const downloadURL = await snapshot.ref.getDownloadURL()
    setValues((values) => ({ ...values, photoURL: downloadURL }))
    setIsPhotoDialogOpen(false)
  }
  const handleValueChange = (name, value) => {
    setValues((values) => {
      const newValues = { ...values, [name]: value || '' }
      validate(newValues)
      return newValues
    })
  }

  const getOAuthProviderByName = (provider) => {
    if (provider.indexOf('google') > -1) {
      return new firebase.firebase_.auth.GoogleAuthProvider()
    }

    throw new window.Error('Provider is not supported!')
  }

  const reauthenticateUser = async (values, onSuccess) => {
    try {
      if (isLinkedWithPasswordProvider) {
        const credential = firebase.firebase_.auth.EmailAuthProvider.credential(
          email,
          values.password
        )
        await firebase
          .auth()
          .currentUser.reauthenticateWithCredential(credential)
      } else if (!isAnonymous) {
        await firebase
          .auth()
          .currentUser.reauthenticateWithPopup(
            getOAuthProviderByName(providerData[0].providerId)
          )
      }
      if (onSuccess && onSuccess instanceof Function) {
        await onSuccess()
      }
    } catch (e) {
      /* TODO notify user of error */
      throw e
    }
  }

  const submit = async () => {
    const simpleChange =
      (values.displayName &&
        values.displayName.localeCompare(displayName) !== 0) ||
      (values.photoURL && values.photoURL.localeCompare(photoURL) !== 0)

    const simpleValues = {
      displayName: values.displayName,
      photoURL: values.photoURL,
    }

    // Change simple data
    if (simpleChange) {
      firebase.updateProfile(simpleValues)
    }

    // Change email
    if (values.email && values.email.localeCompare(email) !== 0) {
      await reauthenticateUser(values, async () => {
        try {
          await firebase.updateEmail(values.email)
          await firebase.reloadAuth()
        } catch (e) {
          if (e.code === 'auth/requires-recent-login') {
            // TODO intl
            notifyError(
              'Authentication error. Log out and in again to change your email.'
            )
          }
        }
      })
    }

    if (isLinkedWithPasswordProvider) {
      // Change password
      if (values.newPassword && values.newPassword === values.confirmPassword) {
        await reauthenticateUser(values, async () => {
          try {
            await firebase.firebase_
              .auth()
              .currentUser.updatePassword(values.newPassword)
            await firebase.logout()
            window.location.reload()
          } catch (e) {
            if (e.code === 'auth/requires-recent-login') {
              // TODO intl
              notifyError(
                'Authentication error. Log out and in again to change your email.'
              )
            }
          }
        })
      }
    }
  }

  const handleDelete = async () => {
    if (!values.password && isLinkedWithPasswordProvider) {
      // TODO intl
      setErrors({ ...errors, password: 'Required' })
      dispatch(setSimpleValue('delete_user', false))
      return
    }

    try {
      await reauthenticateUser(values, async () => {
        try {
          await Promise.all([
            async () => {
              const userDataRef = firebase.ref(`/users/${uid}`)
              const userDataSnapshot = await userDataRef.once('value')
              if (userDataSnapshot.exists()) {
                userDataRef.remove()
              }
            },
            async () => {
              const userRolesRef = firebase.ref(`/user_roles/${uid}`)
              const userRolesSnapshot = await userRolesRef.once('value')
              if (userRolesSnapshot.exists()) {
                userRolesRef.remove()
              }
            },
          ])
          await firebase.firebase_.auth().currentUser.delete()
          window.location.reload()
        } catch (e) {
          /* TODO notify user of error */
          if (e.code === 'auth/requires-recent-login') {
            // TODO intl
            notifyError(
              'Authentication error. Log out and in again to change your email.'
            )
          }
        }
      })
    } catch (e) {
      // TODO intl
      dispatch(setSimpleValue('delete_user', false))
      notifyError('Failed to delete your account.')
    }
  }

  const validate = (values) => {
    const errors = {}

    if (userPropsLoading) {
      return
    }

    if (!values.displayName) {
      errors.displayName = 'Required'
    }

    if (!isAnonymous) {
      if (!values.email) {
        errors.email = 'Required'
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
      ) {
        // TODO intl
        errors.email = 'Invalid email address'
      } else if (!values.password && email.localeCompare(values.email) !== 0) {
        // TODO intl
        errors.password = 'For email change enter your current password'
      }
    }

    if (isLinkedWithPasswordProvider) {
      if (!emailVerified) {
        // TODO intl
        errors.newPassword = 'Email not verified'
        // TODO intl
        errors.confirmPassword = 'Email not verified'
      }

      if (values.newPassword) {
        if (values.newPassword.length < 6) {
          // TODO intl
          errors.newPassword = 'Password should be at least 6 characters'
        } else if (
          values.newPassword.localeCompare(values.confirmPassword) !== 0
        ) {
          // TODO intl
          errors.newPassword = 'Must be equal'
          // TODO intl
          errors.confirmPassword = 'Must be equal'
        }

        if (!values.password) {
          // TODO intl
          errors.password = 'Required'
        }
      }
    }

    setErrors(errors)
  }

  const canDelete = () => !errors.password

  const canSave = () => {
    if (Object.keys(errors).length) {
      return false
    }

    return (
      values.displayName !== displayName ||
      values.email !== email ||
      values.photoURL !== photoURL ||
      !!values.newPassword
    )
  }

  const classes = useStyles()

  return (
    <Activity
      isLoading={userPropsLoading}
      iconStyleRight={{ width: '50%' }}
      appBarContent={
        <div style={{ display: 'flex' }}>
          {uid && (
            <IconButton
              color="inherit"
              disabled={!canSave()}
              aria-label="open drawer"
              onClick={submit}
            >
              <Save className="material-icons" />
            </IconButton>
          )}

          {uid && (
            <IconButton
              disabled={!canDelete()}
              color="inherit"
              aria-label="open drawer"
              onClick={() => dispatch(setSimpleValue('delete_user', true))}
            >
              <Delete className="material-icons" />
            </IconButton>
          )}
        </div>
      }
      title={intl.formatMessage({ id: 'my_account' })}
    >
      {!userPropsLoading && (
        <div>
          {uid && (
            <div
              style={{
                margin: 15,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {values.photoURL && (
                  <Avatar
                    alt={displayName}
                    src={values.photoURL}
                    className={classNames(classes.avatar, classes.bigAvatar)}
                  />
                )}
                {!values.photoURL && (
                  <Avatar
                    className={classNames(classes.avatar, classes.bigAvatar)}
                  >
                    <Person style={{ fontSize: 60 }} />{' '}
                  </Avatar>
                )}

                <IconButton
                  color="primary"
                  onClick={() => setIsPhotoDialogOpen(true)}
                >
                  <PhotoCamera />
                </IconButton>
              </div>

              <div
                style={{
                  margin: 15,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <FormControl
                  className={classNames(classes.margin, classes.textField)}
                  error={!!errors.displayName}
                >
                  <InputLabel htmlFor="displayName">
                    {intl.formatMessage({
                      id: 'name_label',
                    })}
                  </InputLabel>
                  <Input
                    id="displayName"
                    fullWidth
                    value={values.displayName}
                    placeholder={intl.formatMessage({
                      id: 'name_hint',
                    })}
                    onChange={(e) => {
                      handleValueChange('displayName', e.target.value)
                    }}
                  />
                  {errors.displayName && (
                    <FormHelperText id="name-helper-text">
                      {errors.displayName}
                    </FormHelperText>
                  )}
                </FormControl>
                {!isAnonymous && (
                  <FormControl
                    className={classNames(classes.margin, classes.textField)}
                    error={!!errors.email}
                  >
                    <InputLabel htmlFor="email">
                      {intl.formatMessage({
                        id: 'email',
                      })}
                    </InputLabel>
                    <Input
                      id="email"
                      label="Email"
                      autoComplete="off"
                      placeholder={intl.formatMessage({
                        id: 'email',
                      })}
                      fullWidth
                      onChange={(e) =>
                        handleValueChange('email', e.target.value)
                      }
                      value={values.email}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="Show email verified"
                            onClick={
                              emailVerified === true
                                ? undefined
                                : handleEmailVerificationsSend
                            }
                          >
                            {emailVerified && <VerifiedUser color="primary" />}
                            {!emailVerified && <Error color="secondary" />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.email && (
                      <FormHelperText id="name-helper-text">
                        {errors.email}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}

                {isLinkedWithPasswordProvider && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <FormControl
                      className={classNames(classes.margin, classes.textField)}
                      error={!!errors.password}
                    >
                      <InputLabel htmlFor="password">Password</InputLabel>
                      <Input
                        id="password"
                        autoComplete="new-password"
                        type={showPasswordValue ? 'text' : 'password'}
                        // value={values.password}
                        onChange={(e) =>
                          handleValueChange('password', e.target.value)
                        }
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              color="primary"
                              aria-label="Toggle password visibility"
                              onClick={() =>
                                setShowPasswordValue(!showPasswordValue)
                              }
                            >
                              {showPasswordValue ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      {errors.password && (
                        <FormHelperText id="name-helper-text">
                          {errors.password}
                        </FormHelperText>
                      )}
                    </FormControl>
                    <FormControl
                      className={classNames(classes.margin, classes.textField)}
                      error={!!errors.newPassword}
                    >
                      <InputLabel htmlFor="new-password">
                        {intl.formatMessage({
                          id: 'new_password',
                        })}
                      </InputLabel>
                      <Input
                        id="new-password"
                        autoComplete="off"
                        type={showNewPasswordValue ? 'text' : 'password'}
                        onChange={(e) =>
                          handleValueChange('newPassword', e.target.value)
                        }
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              color="primary"
                              aria-label="Toggle password visibility"
                              onClick={() =>
                                setShowNewPasswordValue(!showNewPasswordValue)
                              }
                            >
                              {showNewPasswordValue ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      {errors.newPassword && (
                        <FormHelperText id="name-helper-text">
                          {errors.newPassword}
                        </FormHelperText>
                      )}
                    </FormControl>
                    <FormControl
                      className={classNames(classes.margin, classes.textField)}
                      error={!!errors.confirmPassword}
                    >
                      <InputLabel htmlFor="confirm-password">
                        {intl.formatMessage({
                          id: 'confirm_password',
                        })}
                      </InputLabel>
                      <Input
                        id="confirm-password"
                        autoComplete="off"
                        type={showConfirmPasswordValue ? 'text' : 'password'}
                        onChange={(e) =>
                          handleValueChange('confirmPassword', e.target.value)
                        }
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              color="primary"
                              aria-label="Toggle password visibility"
                              onClick={() =>
                                setShowConfirmPasswordValue(
                                  !showConfirmPasswordValue
                                )
                              }
                            >
                              {showConfirmPasswordValue ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      {errors.confirmPassword && (
                        <FormHelperText id="name-helper-text">
                          {errors.confirmPassword}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                )}
              </div>
            </div>
          )}

          <QuestionDialog
            name="delete_user"
            handleAction={handleDelete}
            title={intl.formatMessage({
              id: 'delete_account_dialog_title',
            })}
            message={intl.formatMessage({
              id: 'delete_account_dialog_message',
            })}
            action={intl.formatMessage({ id: 'delete' })}
          />

          <ImageCropDialog
            path={`users/${uid}`}
            fileName="photoURL"
            onUploadSuccess={(s) => handlePhotoUploadSuccess(s)}
            open={isPhotoDialogOpen}
            src={newUserPhoto}
            handleClose={() => setIsPhotoDialogOpen(false)}
            title={intl.formatMessage({ id: 'change_photo' })}
          />
        </div>
      )}
    </Activity>
  )
})

MyAccount.propTypes = {}

export default MyAccount
