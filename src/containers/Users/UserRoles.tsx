import { Divider, List, ListItem, ListItemSecondaryAction, ListItemText, Switch } from '@material-ui/core'
import AccountBox from '@material-ui/icons/AccountBox'
import React, { FunctionComponent } from 'react'
import ReactList from 'react-list'
import { useFirebase } from 'react-redux-firebase'
import { useParams } from 'react-router-dom'
import type { RoleSchema } from '../../@types/FirebaseDataBaseSchema'
import AltIconAvatar from '../../components/AltIconAvatar'
import { useRoles, useRolesLoading, useUserRoleEnabled } from '../../utils/auth'

const UserRoleItem: FunctionComponent<{
  uid: string
  roleEntry: { key: string; value: RoleSchema }
  handleRoleToggleChange: (e: React.ChangeEvent<HTMLInputElement>, checked: boolean, roleId: string) => void
}> = ({ uid, roleEntry, handleRoleToggleChange }) => {
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
      <Divider variant="inset" />
    </div>
  )
}

const UserRoles: FunctionComponent<{ setIsLoading: (loading: boolean) => void }> = ({ setIsLoading }) => {
  const { uid } = useParams()
  const firebase = useFirebase()
  const roles = useRoles()
  const rolesIsLoading = useRolesLoading()
  setIsLoading(rolesIsLoading)

  const handleRoleToggleChange = (e: React.ChangeEvent<HTMLInputElement>, isInputChecked: boolean, key: string) => {
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
          itemRenderer={(idx) => (
            <UserRoleItem roleEntry={roles[idx]} uid={uid} handleRoleToggleChange={handleRoleToggleChange} />
          )}
          length={roles ? roles.length : 0}
          type="simple"
        />
      </List>
    </div>
  )
}

export default React.memo(UserRoles)
