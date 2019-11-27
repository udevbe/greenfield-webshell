import React from 'react'
import Scrollbar from '../../components/Scrollbar'
import SelectableMenuList from '../../containers/SelectableMenuList'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useFirebase } from 'react-redux-firebase'
import { setDrawerMobileOpen } from '../../store/drawer/actions'
import { withA2HS } from 'a2hs'

// TODO get rid of a2hs and replace it with something better
export const DrawerContent = ({ deferredPrompt, isAppInstallable, isAppInstalled }) => {
  const appConfig = useAppConfig()
  const handleSignOut = async () => {
    await database.ref(`users/${profile.uid}/connections`).remove()
    // TODO get messaging working
    // await database.ref(`users/${profile.uid}/notificationTokens/${messaging.token}`).remove()
    // TODO use firebase' build in user meta data functionality
    await database.ref(`users/${profile.uid}/lastOnline`).set(new Date())
    await firebase.logout()
    window.location.reload()
  }

  const menuItems = appConfig.useMenuItems(deferredPrompt, isAppInstallable, isAppInstalled, handleSignOut)
  const dispatch = useDispatch()
  const history = useHistory()
  const firebase = useFirebase()
  const { database, profile } = useSelector(({ firebase: { database, profile } }) => ({ database, profile }))
  const dialogs = useSelector(({ dialogs }) => dialogs)
  const drawer = useSelector(({ drawer }) => drawer)
  const params = useParams()

  const handleChange = (event, index) => {
    if (index !== undefined) {
      dispatch(setDrawerMobileOpen(false))
    }

    if (index !== undefined && index !== Object(index)) {
      history.push(index)
    }
  }

  const isAuthMenu = !!dialogs.auth_menu

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Scrollbar>
        {isAuthMenu && (
          <SelectableMenuList
            items={menuItems}
            onIndexChange={handleChange}
            index={params ? params.path : '/'}
            useMinified={drawer.useMinified && !drawer.open}
          />
        )}
        {!isAuthMenu && (
          <SelectableMenuList
            items={menuItems}
            onIndexChange={handleChange}
            index={params ? params.path : '/'}
            useMinified={drawer.useMinified && !drawer.open}
          />
        )}
      </Scrollbar>
    </div>
  )
}

export default withA2HS(DrawerContent)
