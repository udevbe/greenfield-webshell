import DrawerContent from './DrawerContent'
import DrawerHeader from './DrawerHeader'
import React from 'react'
import ResponsiveDrawer from '../../containers/ResponsiveDrawer'

const Drawer = React.memo(() => {
  return (
    <ResponsiveDrawer>
      <DrawerHeader />
      <DrawerContent />
    </ResponsiveDrawer>
  )
})

export default Drawer
