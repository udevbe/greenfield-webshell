import Activity from '../../containers/Activity'
import AltIconAvatar from '../../components/AltIconAvatar'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Toolbar from '@material-ui/core/Toolbar'

import Email from '@material-ui/icons/Email'
import OfflinePin from '@material-ui/icons/OfflinePin'
import Person from '@material-ui/icons/Person'
import Phone from '@material-ui/icons/Phone'
import React from 'react'
import ReactList from 'react-list'
import Scrollbar from '../../components/Scrollbar'
import { FacebookIcon, GitHubIcon, GoogleIcon, TwitterIcon } from '../../components/Icons'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import { isLoaded, useFirebaseConnect } from 'react-redux-firebase'

const Users = () => {
  const { select } = useParams()
  const isSelecting = select || false
  const history = useHistory()
  const intl = useIntl()
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
    const user = userEntry.value
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

export default Users
