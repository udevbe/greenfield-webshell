import AccountBox from '@material-ui/icons/AccountBox'
import AltIconAvatar from '../../components/AltIconAvatar'
import { Divider, List, ListItem, ListItemSecondaryAction, ListItemText, Switch } from '@material-ui/core'
import React from 'react'
import ReactList from 'react-list'
import { shallowEqual, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'

const UserRoles = () => {
  const { uid } = useParams()
  const firebase = useFirebase()
  useFirebaseConnect([{ path: '/roles' }])
  useFirebaseConnect([{ path: `/user_roles/${uid}` }], [uid])
  const roles = useSelector(state => state.firebase.ordered.roles)
  // TODO use a query that directly fetches the user's roles
  const allUsersRoles = useSelector(state => state.firebase.data.user_roles[uid] || {}, shallowEqual)

  const handleRoleToggleChange = (e, isInputChecked, key) => {
    if (isInputChecked) {
      firebase.ref(`/user_roles/${uid}/${key}`).set(true)
    } else {
      firebase.ref(`/user_roles/${uid}/${key}`).remove()
    }
  }

  const renderRoleItem = i => {
    const key = roles[i].key
    const val = roles[i].value
    const hasUserRole = allUsersRoles[key] || false

    return (
      <div key={key}>
        <ListItem key={i} id={i}>
          <AltIconAvatar icon={<AccountBox />} />
          <ListItemText primary={val.name} secondary={val.description} />
          <ListItemSecondaryAction>
            <Switch
              checked={hasUserRole}
              onChange={(e, isInputChecked) => handleRoleToggleChange(e, isInputChecked, key)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <Divider variant='inset' />
      </div>
    )
  }

  return (
    <div style={{ height: '100%' }}>
      <List style={{ height: '100%' }}>
        <ReactList
          itemRenderer={renderRoleItem}
          length={roles ? roles.length : 0}
          type='simple'
        />
      </List>
    </div>
  )
}

UserRoles.propTypes = {}

export default UserRoles
