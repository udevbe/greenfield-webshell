import AltIconAvatar from '../../components/AltIconAvatar'
import { Check } from '@material-ui/icons'
import { Divider, List, ListItem, ListItemSecondaryAction, ListItemText, Switch } from '@material-ui/core'
import { compose } from 'redux'
import React from 'react'
import ReactList from 'react-list'
import { connect, useSelector } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withAppConfigs } from '../../contexts/AppConfigProvider'
import { withRouter } from 'react-router-dom'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'

const UserGrants = ({ appConfig, intl, userGrantsPath }) => {
  useFirebaseConnect([{ path: userGrantsPath, storeAs: 'user_grants' }])
  const user_grants = useSelector(state => state.firebase.ordered.user_grants)
  const firebaseApp = useFirebase().app

  const handleGrantToggleChange = (e, isInputChecked, key) => {
    const ref = firebaseApp.database().ref(`${userGrantsPath}/${key}`)
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

const mapStateToProps = (state, ownProps) => {
  const { auth, intl } = state
  const { match: { params: { uid, rootPath, rootUid } } } = ownProps
  const userGrantsPath = rootPath ? `/${rootPath}_user_grants/${uid}/${rootUid}` : `/user_grants/${uid}`

  return {
    auth,
    uid,
    intl,
    userGrantsPath
  }
}

export default compose(
  connect(mapStateToProps),
  injectIntl,
  withRouter,
  withAppConfigs
)(UserGrants)
