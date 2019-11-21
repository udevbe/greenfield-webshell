import { AccountBox, Add } from '@material-ui/icons'
import Activity from '../../containers/Activity'
import AltIconAvatar from '../../components/AltIconAvatar'
import { Divider, Fab, List, ListItem, ListItemText } from '@material-ui/core'
import React from 'react'
import ReactList from 'react-list'
import Scrollbar from '../../components/Scrollbar/Scrollbar'
import { compose } from 'redux'
import { useSelector } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { isLoaded, useFirebase, useFirebaseConnect } from 'react-redux-firebase'

export const Roles = ({ history, intl }) => {
  const firebase = useFirebase()
  const firebaseApp = firebase.app

  useFirebaseConnect([{ path: '/roles' }])

  const roles = useSelector(state => state.firebase.ordered.roles)

  const handleCreateClick = () => {
    const newRole = firebaseApp.database().ref('/roles').push()
    firebaseApp.database().ref('/roles').push().update({ name: 'New Role' }).then(() => history.push(`/roles/edit/${newRole.key}/main`))
  }

  const renderItem = i => {
    const key = roles[i].key
    const val = roles[i].val

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

export default compose(
  injectIntl,
  withRouter
)(Roles)
