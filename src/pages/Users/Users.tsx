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
import type { FunctionComponent } from 'react'
import React from 'react'
import ReactList from 'react-list'
import Scrollbar from '../../components/Scrollbar'
import { GoogleIcon } from '../../components/Icons'
import { useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { isLoaded, useFirebaseConnect } from 'react-redux-firebase'
import { push } from 'connected-react-router'

export interface ProviderData {
  providerId: 'password' | 'google.com'
}

export interface User {
  displayName: string
  uid: string
  photoURL?: string
  lastOnline?: number
  connections?: {
    [key: string]: boolean
  }
  providerData?: ProviderData[]
}

const Users: FunctionComponent = () => {
  const { select } = useParams()
  const isSelecting = select || false
  const dispatch = useDispatch()
  const intl = useIntl()
  useFirebaseConnect([{ path: '/users' }])
  const users: {
    key: string
    value: User
  }[] = useSelector((state) => state.firebase.ordered.users)

  const getProviderIcon = (provider: ProviderData) => {
    const color = 'primary'

    switch (provider.providerId) {
      case 'google.com':
        return <GoogleIcon color={color} />
      case 'password':
        return <Email color={color} />
      default:
        return undefined
    }
  }

  const renderItem = (index: number, key: number | string): JSX.Element => {
    const userEntry = users[index]
    const user = userEntry.value
    const userKey = userEntry.key
    const handleRowClick = () =>
      dispatch(
        push(
          isSelecting
            ? `/${isSelecting}/${userKey}`
            : `/users/edit/${userKey}/profile`
        )
      )

    return (
      <div key={key}>
        <ListItem key={key} onClick={handleRowClick} id={`${key}`}>
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
              user.providerData.map((p, i) => (
                <div key={i}>{getProviderIcon(p)}</div>
              ))}
          </Toolbar>
          <OfflinePin color={user.connections ? 'primary' : 'disabled'} />
        </ListItem>
        <Divider variant="inset" />
      </div>
    )
  }

  return (
    <Activity
      pageTitle={intl.formatMessage({ id: 'users' })}
      appBarTitle={intl.formatMessage({ id: 'users' })}
      isLoading={!isLoaded(users)}
    >
      <div style={{ height: '100%', overflow: 'none' }}>
        <Scrollbar>
          <List component="div">
            <ReactList
              itemRenderer={renderItem}
              length={users ? users.length : 0}
              type="simple"
            />
          </List>
        </Scrollbar>
      </div>
    </Activity>
  )
}

export default React.memo(Users)
