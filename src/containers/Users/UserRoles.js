import { AccountBox } from '@material-ui/icons'
import AltIconAvatar from '../../components/AltIconAvatar'
import { Divider, List, ListItem, ListItemSecondaryAction, ListItemText, Switch } from '@material-ui/core'
import React from 'react'
import ReactList from 'react-list'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useFirebaseConnect } from 'react-redux-firebase'

const UserRoles = () => {
  const { uid } = useParams()
  const userRolesPath = `/user_roles/${uid}`
  useFirebaseConnect([{ path: '/roles' }])
  useFirebaseConnect([{ path: userRolesPath, storeAs: 'user_roles' }])
  const roles = useSelector(state => state.firebase.ordered.roles)
  const user_roles = useSelector(state => state.firebase.ordered.user_roles)
  const database = useSelector(({ firebase: { database } }) => database)

  const handleRoleToggleChange = (e, isInputChecked, key) => {
    const ref = database.ref(`${userRolesPath}/${key}`)
    if (isInputChecked) {
      ref.set(true)
    } else {
      ref.remove()
    }
  }

  const renderRoleItem = i => {
    const key = roles[i].key
    const val = roles[i].val
    const userRoles = []

    if (user_roles !== undefined) {
      user_roles.map(role => {
        if (role.key === key) {
          if (role.val !== undefined) {
            userRoles[role.key] = role.val
          }
        }
        return role
      })
    }

    return (
      <div key={key}>
        <ListItem key={i} id={i}>
          <AltIconAvatar icon={<AccountBox />} />
          <ListItemText primary={val.name} secondary={val.description} />
          <ListItemSecondaryAction>
            <Switch
              checked={userRoles[key] === true}
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
