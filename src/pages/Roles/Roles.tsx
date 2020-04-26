import { AccountBox, Add } from '@material-ui/icons'
import Activity from '../../containers/Activity'
import AltIconAvatar from '../../components/AltIconAvatar'
import { Divider, Fab, List, ListItem, ListItemText } from '@material-ui/core'
import type { FunctionComponent } from 'react'
import React from 'react'
import ReactList from 'react-list'
import Scrollbar from '../../components/Scrollbar/Scrollbar'
import { useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { isLoaded, useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { push } from 'connected-react-router'

export const Roles: FunctionComponent = () => {
  const dispatch = useDispatch()
  const intl = useIntl()
  const firebase = useFirebase()

  useFirebaseConnect([{ path: '/roles' }])
  const roles = useSelector((state) => state.firebase.ordered.roles || [])

  const handleCreateClick = () => {
    const newRole = firebase.ref('/roles').push()
    newRole
      .update({ name: 'New Role' })
      .then(() => dispatch(push(`/roles/edit/${newRole.key}/main`)))
  }

  const renderItem = (i: number) => {
    const key = roles[i].key
    const val = roles[i].value

    return (
      <div key={key}>
        <ListItem
          key={i}
          onClick={() => dispatch(push(`/roles/edit/${key}/main`))}
          id={`${i}`}
        >
          <AltIconAvatar icon={<AccountBox />} />
          <ListItemText primary={val.name} secondary={val.description} />
        </ListItem>
        <Divider variant="inset" />
      </div>
    )
  }

  return (
    <Activity
      isLoading={!isLoaded(roles)}
      pageTitle={intl.formatMessage({ id: 'roles' })}
      appBarTitle={intl.formatMessage({ id: 'roles' })}
    >
      <div style={{ height: '100%' }}>
        <Scrollbar>
          <List>
            <ReactList
              itemRenderer={renderItem}
              length={roles.length}
              type="simple"
            />
          </List>
        </Scrollbar>
        <div style={{ float: 'left', clear: 'both' }} />

        <div
          style={{
            position: 'fixed',
            right: 18,
            zIndex: 3,
            bottom: 18,
          }}
        >
          <Fab color="secondary" onClick={handleCreateClick}>
            <Add className="material-icons" />
          </Fab>
        </div>
      </div>
    </Activity>
  )
}

export default React.memo(Roles)
