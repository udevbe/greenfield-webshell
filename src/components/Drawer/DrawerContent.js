import React from 'react'
import Scrollbar from '../../components/Scrollbar'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useFirebase } from 'react-redux-firebase'
import { useUserId } from '../../utils/auth'
import ListItem from '@material-ui/core/ListItem'
import { popDrawerPath } from '../../store/drawer'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ArrowBack from '@material-ui/icons/ArrowBack'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import { DrawerListEntry } from './DrawerContentList'

export const DrawerContent = React.memo(() => {
  const appConfig = useAppConfig()
  const firebase = useFirebase()
  const uid = useUserId()
  const dispatch = useDispatch()
  const drawerPath = useSelector(({ drawer: { drawerPath } }) => drawerPath, shallowEqual)

  const handleSignOut = async () => {
    await firebase.ref(`/users/${uid}/connections`).remove()
    await firebase.ref(`/users/${uid}/lastOnline`).set(new Date())
    await firebase.logout()
    window.location.reload()
  }
  const rootMenuItem = appConfig.useMenuItems(handleSignOut)

  const { selectedMenuItem, listItem } = drawerPath.reduce(({ selectedMenuItem }, drawerPathSegment) => {
    const selectedItem = selectedMenuItem.entries[drawerPathSegment]
    return {
      selectedMenuItem: selectedItem,
      listItem: selectedItem.variant === 'listItem' ? selectedItem : selectedMenuItem
    }
  }, { selectedMenuItem: rootMenuItem, listItem: rootMenuItem })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Scrollbar>
        <List>
          {
            listItem !== rootMenuItem &&
              <div>
                <ListItem
                  button
                  onClick={() => dispatch(popDrawerPath())}
                >
                  <ListItemIcon>
                    <ArrowBack />
                  </ListItemIcon>
                  <ListItemText primary={listItem.text} />
                </ListItem>
                <Divider />
              </div>
          }
          {
            Object.entries(listItem.entries).filter(([_, entry]) => entry.visible !== false).map(([key, entry]) =>
              <DrawerListEntry
                key={key}
                drawerPathSegment={key}
                drawerEntry={entry}
                selected={entry === selectedMenuItem}
              />)
          }
        </List>
      </Scrollbar>
    </div>
  )
})

export default DrawerContent
