import AccountBox from '@material-ui/icons/AccountBox'
import Activity from '../../containers/Activity'
import AppBar from '@material-ui/core/AppBar'
import Lock from '@material-ui/icons/Lock'
import Person from '@material-ui/icons/Person'
import React, { useEffect, useState } from 'react'
import Scrollbar from '../../components/Scrollbar'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import UserForm from '../../components/Forms/UserForm'
import UserGrants from '../../containers/Users/UserGrants'
import UserRoles from '../../containers/Users/UserRoles'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
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

export const User = () => {
  const { uid, editType } = useParams()
  const history = useHistory()
  const intl = useIntl()
  const [values, setValues] = useState({})
  const firebase = useFirebase()

  useFirebaseConnect([{ path: 'admins' }])
  useFirebaseConnect([{ path: 'user_roles' }])
  useFirebaseConnect([{ path: 'user_grants' }])

  const admins = useSelector(state => state.firebase.ordered.admins)
  const userRoles = useSelector(state => state.firebase.ordered.user_roles)
  const userGrants = useSelector(state => state.firebase.ordered.user_grants)

  const dataLoaded = isLoaded(admins) && isLoaded(userRoles) && isLoaded(userGrants)

  useEffect(() => {
    firebase.ref(`users/${uid}`).on('value', snap => setValues(snap.val()))
    return () => firebase.ref(`users/${uid}`).off()
  }, [firebase, uid, values])

  const handleTabActive = (e, value) => history.push(`/users/edit/${uid}/${value}`)

  const handleAdminChange = (e, isInputChecked) => {
    if (isInputChecked) {
      firebase.ref(`/admins/${uid}`).set(true)
    } else {
      firebase.ref(`/admins/${uid}`).remove()
    }
  }

  let isAdmin = false

  if (admins !== undefined) {
    for (const admin of admins) {
      if (admin.key === uid) {
        isAdmin = true
        break
      }
    }
  }

  const classes = useStyles()
  return (
    <Activity
      isLoading={!dataLoaded}
      onBackClick={() => history.push('/users')}
      title={intl.formatMessage({ id: 'edit_user' })}
    >{dataLoaded &&
    <Scrollbar style={{ height: '100%' }}>
        <div className={classes.root}>
          <AppBar position='static'>
            <Tabs value={editType || 'data'} onChange={handleTabActive} fullWidth centered>
              <Tab value='profile' icon={<Person className='material-icons' />} />
              <Tab value='roles' icon={<AccountBox className='material-icons' />} />
              <Tab value='grants' icon={<Lock className='material-icons' />} />
            </Tabs>
          </AppBar>

          {editType === 'profile' && (
            <div className={classes.form}>
              <UserForm
                handleAdminChange={handleAdminChange}
                isAdmin={isAdmin}
                values={values || {}}
              />
            </div>
          )}
          {editType === 'roles' && <UserRoles />}
          {editType === 'grants' && <UserGrants />}
        </div>
      </Scrollbar>}
    </Activity>
  )
}

User.propTypes = {}

export default User
