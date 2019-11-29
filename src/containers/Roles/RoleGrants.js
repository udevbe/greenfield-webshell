import AltIconAvatar from '../../components/AltIconAvatar'
import Check from '@material-ui/icons/Check'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import React from 'react'
import ReactList from 'react-list'
import Switch from '@material-ui/core/Switch'
import { useIntl } from 'react-intl'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { useParams } from 'react-router-dom'
import { useFirebase } from 'react-redux-firebase'

export const RoleGrants = ({ roleGrants }) => {
  const intl = useIntl()
  const appConfig = useAppConfig()
  const firebase = useFirebase()

  const params = useParams()
  const uid = params.uid ? params.uid : ''

  const handleGrantToggleChange = (e, isInputChecked, key) => {
    if (isInputChecked) {
      firebase.database().ref(`/role_grants/${uid}/${key}`).set(true)
    } else {
      firebase.database().ref(`/role_grants/${uid}/${key}`).remove()
    }
  }

  const grantList = appConfig.grants.map((grant, index) => ({
    key: index,
    val: { name: intl.formatMessage({ id: `grant ${grant}` }), value: grant }
  }))

  const renderGrantItem = (i, k) => {
    const key = grantList[i].key
    const val = appConfig.grants[grantList[i].key]
    let roleGrantValues = []

    if (roleGrants) {
      roleGrants.map(role => {
        if (role.key === uid) {
          if (role.value !== undefined) {
            roleGrantValues = role.value
          }
        }
        return role
      })
    }

    return (
      <div key={key}>
        <ListItem key={i} id={i}>
          <AltIconAvatar icon={<Check />} />
          <ListItemText primary={intl.formatMessage({ id: `grant ${val}` })} secondary={val} />
          <Switch
            checked={roleGrantValues[val] === true}
            onChange={(e, isInputChecked) => handleGrantToggleChange(e, isInputChecked, val)}
          />
        </ListItem>
        <Divider variant='inset' />
      </div>
    )
  }

  return (
    <div style={{ height: '100%' }}>
      <List style={{ height: '100%' }}>
        <ReactList
          itemRenderer={renderGrantItem}
          length={grantList.length}
          type='simple'
        />
      </List>
    </div>
  )
}

RoleGrants.propTypes = {}

export default RoleGrants
