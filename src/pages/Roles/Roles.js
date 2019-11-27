import { AccountBox, Add } from '@material-ui/icons'
import Activity from '../../containers/Activity'
import AltIconAvatar from '../../components/AltIconAvatar'
import { Divider, Fab, List, ListItem, ListItemText } from '@material-ui/core'
import React from 'react'
import ReactList from 'react-list'
import Scrollbar from '../../components/Scrollbar/Scrollbar'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { isLoaded, useFirebase, useFirebaseConnect } from 'react-redux-firebase'

export const Roles = () => {
  const history = useHistory()
  const intl = useIntl()
  const firebase = useFirebase()

  useFirebaseConnect([{ path: '/roles' }])
  const roles = useSelector(state => state.firebase.ordered.roles)

  const handleCreateClick = () => {
    const newRole = firebase.ref('/roles').push()
    firebase.ref('/roles').push().update({ name: 'New Role' }).then(() => history.push(`/roles/edit/${newRole.key}/main`))
  }

  const renderItem = i => {
    const key = roles[i].key
    const val = roles[i].value

    return (
      <div key={key}>
        <ListItem
          key={i}
          onClick={() => history.push(`/roles/edit/${key}/main`)}
          id={i}
        >
          <AltIconAvatar icon={<AccountBox />} />
          <ListItemText primary={val.name} secondary={val.description} />
        </ListItem>
        <Divider variant='inset' />
      </div>
    )
  }

  return (
    <Activity isLoading={!isLoaded(roles)} title={intl.formatMessage({ id: 'roles' })}>
      <div style={{ height: '100%' }}>
        <Scrollbar>
          <List>
            <ReactList itemRenderer={renderItem} length={roles.length} type='simple' />
          </List>
        </Scrollbar>
        <div style={{ float: 'left', clear: 'both' }} />

        <div style={{ position: 'fixed', right: 18, zIndex: 3, bottom: 18 }}>
          <Fab color='secondary' onClick={handleCreateClick}>
            <Add className='material-icons' />
          </Fab>
        </div>
      </div>
    </Activity>
  )
}

Roles.propTypes = {}

export default Roles
