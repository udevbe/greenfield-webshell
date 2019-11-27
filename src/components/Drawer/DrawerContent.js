import React from 'react'
import Scrollbar from '../../components/Scrollbar'
import SelectableMenuList from '../../containers/SelectableMenuList'
import { useAppConfig } from '../../contexts/AppConfigProvider'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { useFirebase } from 'react-redux-firebase'
import { setDrawerMobileOpen } from '../../store/drawer/actions'
import { withA2HS } from 'a2hs'

// TODO get rid of a2hs and replace it with something better
export const DrawerContent = ({ deferredPrompt, isAppInstallable, isAppInstalled }) => {
  const appConfig = useAppConfig()
  const firebase = useFirebase()
  const uid = useStore().getState().firebase.auth.uid
  const dispatch = useDispatch()
  const history = useHistory()
  const drawer = useSelector(({ drawer }) => drawer)
  const params = useParams()

  const handleSignOut = async () => {
    await firebase.ref(`users/${uid}/connections`).remove()
    // TODO get messaging working
    // await database.ref(`users/${profile.uid}/notificationTokens/${messaging.token}`).remove()
    // TODO use firebase' build in user meta data functionality
    await firebase.ref(`users/${uid}/lastOnline`).set(new Date())
    await firebase.logout()
    window.location.reload()
  }
  const menuItems = appConfig.useMenuItems(deferredPrompt, isAppInstallable, isAppInstalled, handleSignOut)

  const handleChange = (event, index) => {
    if (index !== undefined) {
      dispatch(setDrawerMobileOpen(false))
    }

    if (index !== undefined && index !== Object(index)) {
      history.push(index)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Scrollbar>
        <SelectableMenuList
          items={menuItems}
          onIndexChange={handleChange}
          index={params.path ? params.path : '/'}
          useMinified={drawer.useMinified && !drawer.open}
        />
      </Scrollbar>
    </div>
  )
}

export default withA2HS(DrawerContent)
