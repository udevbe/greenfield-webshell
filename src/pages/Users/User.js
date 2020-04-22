import AccountBox from '@material-ui/icons/AccountBox'
import Activity from '../../containers/Activity'
import AppBar from '@material-ui/core/AppBar'
import Person from '@material-ui/icons/Person'
import React, { useState } from 'react'
import Scrollbar from '../../components/Scrollbar'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import UserForm from '../../components/Forms/UserForm'
import UserRoles from '../../containers/Users/UserRoles'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { useFirebase } from 'react-redux-firebase'
import { useIsAdmin, useIsAdminLoading } from '../../utils/auth'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

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

export const User = React.memo(() => {
  const { uid, editType } = useParams()
  const dispatch = useDispatch()
  const intl = useIntl()
  const firebase = useFirebase()
  const isAdmin = useIsAdmin(uid)
  const loading = useIsAdminLoading(uid)
  const [isLoading, setIsLoading] = useState(loading)

  const handleTabActive = (e, value) =>
    dispatch(push(`/users/edit/${uid}/${value}`))

  const handleAdminChange = (e, isInputChecked) => {
    if (isInputChecked) {
      firebase.ref(`/admins/${uid}`).set(true)
    } else {
      firebase.ref(`/admins/${uid}`).remove()
    }
  }

  const classes = useStyles()
  return (
    <Activity
      isLoading={isLoading}
      onBackClick={() => dispatch(push('/users'))}
      title={intl.formatMessage({ id: 'edit_user' })}
    >
      <Scrollbar style={{ height: '100%' }}>
        <div className={classes.root}>
          <AppBar position="static">
            <Tabs
              value={editType || 'data'}
              onChange={handleTabActive}
              fullWidth
              centered
            >
              <Tab
                value="profile"
                icon={<Person className="material-icons" />}
              />
              <Tab
                value="roles"
                icon={<AccountBox className="material-icons" />}
              />
            </Tabs>
          </AppBar>

          {editType === 'profile' && (
            <div className={classes.form}>
              <UserForm
                handleAdminChange={handleAdminChange}
                isAdmin={isAdmin}
                uid={uid}
              />
            </div>
          )}
          {editType === 'roles' && <UserRoles setIsLoading={setIsLoading} />}
        </div>
      </Scrollbar>
    </Activity>
  )
})

User.propTypes = {}

export default User
