import React, { FunctionComponent } from 'react'
import { DrawerHeader } from '../../components/Drawer'
import ResponsiveDrawer from '../../containers/ResponsiveDrawer'
import DrawerContent from './DrawerContent'

const Drawer: FunctionComponent = () => {
  return (
    <ResponsiveDrawer>
      <DrawerHeader />
      <DrawerContent />
    </ResponsiveDrawer>
  )
}

export default React.memo(Drawer)
