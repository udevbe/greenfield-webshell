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
import { connect, useSelector } from 'react-redux'
import { compose } from 'redux'
import { injectIntl } from 'react-intl'
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

export const User = (props) => {
  const { uid, rootPath, history, rootUid, intl, editType } = props
  const [values, setValues] = useState({})

  useFirebaseConnect([{ path: 'admins' }])
  useFirebaseConnect([{ path: 'user_roles' }])
  useFirebaseConnect([{ path: 'user_grants' }])

  const admins = useSelector(state => state.firebase.ordered.admins)
  const userRoles = useSelector(state => state.firebase.ordered.user_roles)
  const userGrants = useSelector(state => state.firebase.ordered.user_grants)

  const dataLoaded = isLoaded(admins) && isLoaded(userRoles) && isLoaded(userGrants)

  const firebase = useFirebase()
  const firebaseApp = firebase.app
  useEffect(() => {
    firebaseApp.database().ref(`users/${uid}`).on('value', snap => setValues(snap.val()))
    return () => firebaseApp.database().ref(`users/${uid}`).off()
  })

  const handleTabActive = (e, value) => {
    if (rootPath) {
      history.push(`/users/edit/${uid}/${value}/${rootPath}/${rootUid}`)
    } else {
      history.push(`/users/edit/${uid}/${value}`)
    }
  }

  const handleAdminChange = (e, isInputChecked) => {
    if (isInputChecked) {
      firebaseApp.database().ref(`/admins/${uid}`).set(true)
    } else {
      firebaseApp.database().ref(`/admins/${uid}`).remove()
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
            <Tabs value={editType} onChange={handleTabActive} fullWidth centered>
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
                {...props}
              />
            </div>
          )}
          {editType === 'roles' && <UserRoles {...props} />}
          {editType === 'grants' && <UserGrants {...props} />}
        </div>
      </Scrollbar>}
    </Activity>
  )
}

User.propTypes = {}

const mapStateToProps = (state, ownProps) => {
  const { intl } = state
  const { match: { params: { uid, editType, rootPath, rootUid } } } = ownProps

  return {
    rootPath,
    rootUid,
    uid,
    editType: editType || 'data',
    intl
  }
}

export default compose(
  connect(mapStateToProps),
  injectIntl,
  withRouter
)(User)
