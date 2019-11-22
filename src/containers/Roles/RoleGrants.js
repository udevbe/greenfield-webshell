import AltIconAvatar from '../../components/AltIconAvatar'
import Check from '@material-ui/icons/Check'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import React from 'react'
import ReactList from 'react-list'
import Switch from '@material-ui/core/Switch'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { setSimpleValue } from '../../store/simpleValues/actions'
import { withAppConfigs } from '../../contexts/AppConfigProvider'
import { withRouter } from 'react-router-dom'
import { useFirebase } from 'react-redux-firebase'

export const RoleGrants = ({
  uid,
  intl,
  roleGrants,
  appConfig
}) => {
  const firebase = useFirebase()
  const firebaseApp = firebase.app

  const handleGrantToggleChange = (e, isInputChecked, key) => {
    if (isInputChecked) {
      firebaseApp.database().ref(`/role_grants/${uid}/${key}`).set(true)
    } else {
      firebaseApp.database().ref(`/role_grants/${uid}/${key}`).remove()
    }
  }

  const grantList = []
  appConfig.grants.forEach((grant, index) => grantList.push({
    key: index,
    val: { name: intl.formatMessage({ id: `grant_${grant}` }), value: grant }
  }))

  const renderGrantItem = (i, k) => {
    const key = grantList[i].key
    const val = appConfig.grants[grantList[i].key]
    let userGrants = []

    if (roleGrants !== undefined) {
      roleGrants.map(role => {
        if (role.key === uid) {
          if (role.val !== undefined) {
            userGrants = role.val
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
          <Switch
            checked={userGrants[val] === true}
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

const mapStateToProps = (state, ownProps) => {
  const { intl } = state
  const { match: { params: { uid } }, roleGrants } = ownProps
  return { uid, intl, roleGrants }
}

export default compose(
  connect(
    mapStateToProps,
    { setSimpleValue }
  ),
  injectIntl,
  withRouter,
  withAppConfigs
)(RoleGrants)
