import AppBar from '@material-ui/core/AppBar'
import { makeStyles } from '@material-ui/core/styles'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import AccountBox from '@material-ui/icons/AccountBox'
import Person from '@material-ui/icons/Person'
import { push } from 'connected-react-router'
import React, { FunctionComponent, useState } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { useFirebase } from 'react-redux-firebase'
import { useParams } from 'react-router-dom'
import UserForm from '../../components/Forms/UserForm'
import Scrollbar from '../../components/Scrollbar'
import Activity from '../../containers/Activity'
import UserRoles from '../../containers/Users/UserRoles'
import { useIsAdmin, useIsAdminLoading } from '../../utils/auth'

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

export const User: FunctionComponent = () => {
  const { uid, editType } = useParams<{ uid: string; editType: string }>()
  if (uid == null) {
    throw new Error('uid param must be defined.')
  }

  const dispatch = useDispatch()
  const intl = useIntl()
  const firebase = useFirebase()
  const isAdmin = useIsAdmin(uid)
  const loading = useIsAdminLoading(uid)
  const [isLoading, setIsLoading] = useState(loading)

  const handleTabActive = (_: any, value: string) => dispatch(push(`/users/edit/${uid}/${value}`))

  const handleAdminChange = (_: any, isInputChecked: boolean) => {
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
      appBarTitle={intl.formatMessage({ id: 'edit_user' })}
      pageTitle={intl.formatMessage({ id: 'edit_user' })}
    >
      <Scrollbar style={{ height: '100%' }}>
        <div className={classes.root}>
          <AppBar position="static">
            <Tabs value={editType || 'data'} onChange={handleTabActive} variant="fullWidth" centered>
              <Tab value="profile" icon={<Person className="material-icons" />} />
              <Tab value="roles" icon={<AccountBox className="material-icons" />} />
            </Tabs>
          </AppBar>

          {editType === 'profile' && (
            <div className={classes.form}>
              <UserForm handleAdminChange={handleAdminChange} isAdmin={isAdmin} uid={uid} />
            </div>
          )}
          {editType === 'roles' && <UserRoles setIsLoading={setIsLoading} />}
        </div>
      </Scrollbar>
    </Activity>
  )
}

export default React.memo(User)
