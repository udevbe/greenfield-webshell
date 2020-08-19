import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ArrowBack from '@material-ui/icons/ArrowBack'
import React, { FunctionComponent } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useFirebase } from 'react-redux-firebase'
import { DrawerListEntry } from '../../components/Drawer'
import Scrollbar from '../../components/Scrollbar'
import type { DrawerEntry, DrawerListItem } from '../../config/menuItems'
import { isDrawerListItem } from '../../config/menuItems'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { popDrawerPath } from '../../store/drawer'
import { useUserId } from '../../utils/auth'

export const DrawerContent: FunctionComponent = () => {
  const appConfig = useAppConfig()
  const firebase = useFirebase()
  const uid = useUserId()
  const dispatch = useDispatch()
  const drawerPath = useSelector((store): string[] => store.drawer.drawerPath, shallowEqual)

  const handleSignOut = async () => {
    await firebase.ref(`/users/${uid}/connections`).remove()
    await firebase.ref(`/users/${uid}/lastOnline`).set(new Date())
    await firebase.logout()
    window.location.reload()
  }
  const rootMenuItem = appConfig.useMenuItems(handleSignOut)

  // find the last entry & the list it came from when traversing the drawer path segment
  const { selectedMenuItem, listItem } = drawerPath.reduce<{ selectedMenuItem: DrawerEntry; listItem: DrawerListItem }>(
    (previous, drawerPathSegment) => {
      const selectedItem = previous.listItem.entries[drawerPathSegment]
      return {
        selectedMenuItem: selectedItem,
        listItem: isDrawerListItem(selectedItem) ? selectedItem : previous.listItem,
      }
    },
    { selectedMenuItem: rootMenuItem, listItem: rootMenuItem }
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Scrollbar>
        <List>
          {listItem !== rootMenuItem && (
            <div>
              <ListItem button onClick={() => dispatch(popDrawerPath())}>
                <ListItemIcon>
                  <ArrowBack />
                </ListItemIcon>
                <ListItemText primary={listItem.text} />
              </ListItem>
              <Divider />
            </div>
          )}
          {Object.entries(listItem.entries)
            .filter(([_, entry]) => entry.visible !== false)
            .map(([key, entry]) => (
              <DrawerListEntry
                key={key}
                drawerPathSegment={key}
                drawerEntry={entry}
                selected={entry === selectedMenuItem}
              />
            ))}
        </List>
      </Scrollbar>
    </div>
  )
}

export default React.memo(DrawerContent)
