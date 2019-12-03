import AltIconAvatar from '../../components/AltIconAvatar'
import Check from '@material-ui/icons/Check'
import { Divider, List, ListItem, ListItemSecondaryAction, ListItemText, Switch } from '@material-ui/core'
import React from 'react'
import ReactList from 'react-list'
import { shallowEqual, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { useParams } from 'react-router-dom'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'

const UserGrants = () => {
  const intl = useIntl()
  const appConfig = useAppConfig()
  const firebase = useFirebase()
  const { uid } = useParams()
  useFirebaseConnect([{ path: '/user_grants' }])
  const userGrants = useSelector(state => state.firebase.ordered.user_grants || [], shallowEqual)

  const handleGrantToggleChange = (e, isInputChecked, key) => {
    if (isInputChecked) {
      firebase.ref(`/user_grants/${uid}/${key}`).set(true)
    } else {
      firebase.ref(`/user_grants/${uid}/${key}`).remove()
    }
  }

  const grantList = appConfig.grants.map((grant, index) => ({
    key: index,
    val: { name: intl.formatMessage({ id: `grant ${grant}` }), value: grant }
  }))

  const renderGrantItem = (list, i) => {
    const key = grantList[i].key
    const val = appConfig.grants[grantList[i].key]

    let userGrantValues = []

    if (userGrants) {
      userGrants.forEach(userGrant => {
        if (userGrant.key === uid) {
          if (userGrant.value !== undefined) {
            userGrantValues = userGrant.value
          }
        }
      })
    }

    return (
      <div key={key}>
        <ListItem key={i} id={i}>
          <AltIconAvatar icon={<Check />} />
          <ListItemText primary={intl.formatMessage({ id: `${val}` })} secondary={val} />
          <ListItemSecondaryAction>
            <Switch
              checked={userGrantValues[key] === true}
              onChange={(e, isInputChecked) => handleGrantToggleChange(e, isInputChecked, key)}
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
