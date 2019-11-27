import AltIconAvatar from '../../components/AltIconAvatar'
import { Check } from '@material-ui/icons'
import { Divider, List, ListItem, ListItemSecondaryAction, ListItemText, Switch } from '@material-ui/core'
import React from 'react'
import ReactList from 'react-list'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { useParams } from 'react-router-dom'
import { useFirebaseConnect } from 'react-redux-firebase'

const UserGrants = () => {
  const intl = useIntl()
  const appConfig = useAppConfig()
  const { uid } = useParams()
  const userGrantsPath = `/user_grants/${uid}`
  useFirebaseConnect([{ path: userGrantsPath, storeAs: 'user_grants' }])
  const user_grants = useSelector(state => state.firebase.ordered.user_grants)
  const database = useSelector(({ firebase: { database } }) => database)

  const handleGrantToggleChange = (e, isInputChecked, key) => {
    const ref = database.ref(`${userGrantsPath}/${key}`)
    if (isInputChecked) {
      ref.set(true)
    } else {
      ref.remove()
    }
  }

  const renderGrantItem = (list, i) => {
    const key = list[i].val ? list[i].val.value : ''
    const val = appConfig.grants[list[i].key]
    const userGrants = []

    if (user_grants !== undefined) {
      user_grants.map(role => {
        if (role.key === key) {
          if (role.val !== undefined) {
            userGrants[role.key] = role.val
          }
        }
        return role
      })
    }

    return (
      <div key={key}>
        <ListItem key={i} id={i}>
          <AltIconAvatar icon={<Check />} />
          <ListItemText primary={intl.formatMessage({ id: `grant_${val}` })} secondary={val} />
          <ListItemSecondaryAction>
            <Switch
              checked={userGrants[key] === true}
              onChange={(e, isInputChecked) => handleGrantToggleChange(e, isInputChecked, key)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <Divider variant='inset' />
      </div>
    )
  }

  // TODO check if grants are loaded
  const grantList = appConfig.grants.map((grant, index) => ({
    key: index,
    val: { name: intl.formatMessage({ id: `grant_${grant}` }), value: grant }
  }))

  return (
    <div style={{ height: '100%' }}>
      <List style={{ height: '100%' }}>
        <ReactList
          itemRenderer={(i, k) => renderGrantItem(grantList, i, k)}
          length={grantList ? grantList.length : 0}
          type='simple'
        />
      </List>
    </div>
  )
}

UserGrants.propTypes = {}

export default UserGrants
