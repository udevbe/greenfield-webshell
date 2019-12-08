import AccountBox from '@material-ui/icons/AccountBox'
import AltIconAvatar from '../../components/AltIconAvatar'
import { Divider, List, ListItem, ListItemSecondaryAction, ListItemText, Switch } from '@material-ui/core'
import React from 'react'
import ReactList from 'react-list'
import { useParams } from 'react-router-dom'
import { useFirebase } from 'react-redux-firebase'
import { useRoles, useRolesLoading, useUserRoleEnabled } from '../../utils/auth'

const UserRoleItem = ({ uid, roleEntry, handleRoleToggleChange }) => {
  const roleId = roleEntry.key
  const { description, name } = roleEntry.value
  const hasUserRole = useUserRoleEnabled(uid, roleId)

  return (
    <div key={roleId}>
      <ListItem key={roleId} id={roleId}>
        <AltIconAvatar icon={<AccountBox />} />
        <ListItemText primary={name} secondary={description} />
        <ListItemSecondaryAction>
          <Switch
            checked={hasUserRole}
            onChange={(e, isInputChecked) => handleRoleToggleChange(e, isInputChecked, roleId)}
          />
        </ListItemSecondaryAction>
      </ListItem>
      <Divider variant='inset' />
    </div>
  )
}

const UserRoles = ({ setIsLoading }) => {
  const { uid } = useParams()
  const firebase = useFirebase()
  const roles = useRoles()
  const rolesIsLoading = useRolesLoading()
  setIsLoading(rolesIsLoading)

  const handleRoleToggleChange = (e, isInputChecked, key) => {
    if (isInputChecked) {
      firebase.ref(`/user_roles/${uid}/${key}`).set(true)
    } else {
      firebase.ref(`/user_roles/${uid}/${key}`).remove()
    }
  }

  return (
    <div style={{ height: '100%' }}>
      <List style={{ height: '100%' }}>
        <ReactList
          itemRenderer={
            idx => (
              <UserRoleItem
                roleEntry={roles[idx]} uid={uid}
                handleRoleToggleChange={handleRoleToggleChange}
              />
            )
          }
          length={roles ? roles.length : 0}
          type='simple'
        />
      </List>
    </div>
  )
}

UserRoles.propTypes = {}

export default UserRoles
