import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Switch from '@material-ui/core/Switch'
import Check from '@material-ui/icons/Check'
import React, { FunctionComponent } from 'react'
import { useIntl } from 'react-intl'
import ReactList from 'react-list'
import { useFirebase } from 'react-redux-firebase'
import { useParams } from 'react-router-dom'
import { RoleGrantSchema } from '../../@types/FirebaseDataBaseSchema'
import AltIconAvatar from '../../components/AltIconAvatar'
import { useAppConfig } from '../../contexts/AppConfigProvider'

const RoleGrants: FunctionComponent<{
  roleGrants: { key: string; value: RoleGrantSchema }[]
}> = ({ roleGrants }) => {
  const intl = useIntl()
  const appConfig = useAppConfig()
  const firebase = useFirebase()

  const params = useParams<{ uid: string }>()
  const uid = params.uid ? params.uid : ''

  const handleGrantToggleChange = (e: React.ChangeEvent<HTMLInputElement>, isInputChecked: boolean, key: string) => {
    if (isInputChecked) {
      firebase.database().ref(`/role_grants/${uid}/${key}`).set(true)
    } else {
      firebase.database().ref(`/role_grants/${uid}/${key}`).remove()
    }
  }

  const grantList = appConfig.grants.map((grant, index) => ({
    key: index,
    val: {
      name: intl.formatMessage({ id: `grant ${grant}` }),
      value: grant,
    },
  }))

  const renderGrantItem = (i: number) => {
    const key = grantList[i].key
    const val = appConfig.grants[grantList[i].key]
    let roleGrantValues: RoleGrantSchema = {}

    if (roleGrants) {
      roleGrants.map((role) => {
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
        <ListItem key={i} id={`${i}`}>
          <AltIconAvatar icon={<Check />} />
          <ListItemText primary={intl.formatMessage({ id: `grant ${val}` })} secondary={val} />
          <Switch
            checked={roleGrantValues[val]}
            onChange={(e, isInputChecked) => handleGrantToggleChange(e, isInputChecked, val)}
          />
        </ListItem>
        <Divider variant="inset" />
      </div>
    )
  }

  return (
    <div style={{ height: '100%' }}>
      <List style={{ height: '100%' }}>
        <ReactList itemRenderer={renderGrantItem} length={grantList.length} type="simple" />
      </List>
    </div>
  )
}

export default React.memo(RoleGrants)
