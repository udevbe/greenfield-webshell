import Activity from '../../containers/Activity'
import AltIconAvatar from '../../components/AltIconAvatar'
import { Divider, List, ListItem, ListItemText, Toolbar } from '@material-ui/core'
import { Email, OfflinePin, Person, Phone } from '@material-ui/icons'
import React from 'react'
import ReactList from 'react-list'
import Scrollbar from '../../components/Scrollbar'
import { FacebookIcon, GitHubIcon, GoogleIcon, TwitterIcon } from '../../components/Icons'
import { compose } from 'redux'
import { connect, useSelector } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { isLoaded, useFirebaseConnect } from 'react-redux-firebase'

const Users = ({ intl, history, isSelecting }) => {
  useFirebaseConnect([{ path: '/users' }])
  const users = useSelector(state => state.firebase.ordered.users)

  const getProviderIcon = provider => {
    const color = 'primary'

    switch (provider.providerId) {
      case 'google.com':
        return <GoogleIcon color={color} />
      case 'facebook.com':
        return <FacebookIcon color={color} />
      case 'twitter.com':
        return <TwitterIcon color={color} />
      case 'github.com':
        return <GitHubIcon color={color} />
      case 'phone':
        return <Phone color={color} />
      case 'password':
        return <Email color={color} />
      default:
        return undefined
    }
  }

  const renderItem = (index, key) => {
    const userEntry = users[index]
    const user = userEntry.val
    const userKey = userEntry.key
    const handleRowClick = () => history.push(isSelecting ? `/${isSelecting}/${userKey}` : `/users/edit/${userKey}/profile`)

    return (
      <div key={key}>
        <ListItem
          key={key}
          onClick={handleRowClick}
          id={key}
        >
          <AltIconAvatar src={user.photoURL} icon={<Person />} />
          <ListItemText
            primary={user.displayName}
            secondary={
              !user.connections && !user.lastOnline
                ? intl.formatMessage({ id: 'offline' })
                : intl.formatMessage({ id: 'online' })
            }
          />
          <Toolbar>
            {user.providerData &&
            user.providerData.map((p, i) => <div key={i}>{getProviderIcon(p)}</div>)}
          </Toolbar>
          <OfflinePin color={user.connections ? 'primary' : 'disabled'} />
        </ListItem>
        <Divider variant='inset' />
      </div>
    )
  }

  return (
    <Activity
      title={intl.formatMessage({ id: 'users' })}
      isLoading={!isLoaded(users)}
    >
      <div style={{ height: '100%', overflow: 'none' }}>
        <Scrollbar>
          <List component='div'>
            <ReactList itemRenderer={renderItem} length={users ? users.length : 0} type='simple' />
          </List>
        </Scrollbar>
      </div>
    </Activity>
  )
}

Users.propTypes = {}

const mapStateToProps = (state, ownProps) => {
  const { auth } = state
  const { match: { params: { select } } } = ownProps
  return {
    isSelecting: select || false,
    auth
  }
}

export default compose(
  connect(mapStateToProps),
  injectIntl,
  withRouter
)(Users)
