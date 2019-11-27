import DrawerContent from './DrawerContent'
import DrawerHeader from './DrawerHeader'
import React from 'react'
import ResponsiveDrawer from '../../containers/ResponsiveDrawer'
import { useHistory } from 'react-router-dom'

const Drawer = () => {
  const history = useHistory()
  const path = history.location.pathname

  return (
    <ResponsiveDrawer>
      <DrawerHeader />
      <DrawerContent path={path} history={history} />
    </ResponsiveDrawer>
  )
}

export default Drawer
