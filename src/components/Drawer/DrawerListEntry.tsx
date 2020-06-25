import React, { FunctionComponent } from 'react'
import { DrawerEntry } from '../../config/menuItems'
import DrawerActionItem from './DrawerAction'
import DrawerInfoItem from './DrawerInfo'
import DrawerListDivider from './DrawerListDivider'
import DrawerListItem from './DrawerList'
import DrawerListSubheader from './DrawerListSubheader'

const DrawerListEntry: FunctionComponent<{
  drawerEntry: DrawerEntry
  drawerPathSegment: string
  selected: boolean
}> = ({ drawerEntry, drawerPathSegment, selected }) => {
  switch (drawerEntry.variant) {
    case 'divider':
      return <DrawerListDivider divider={drawerEntry} />
    case 'subheader':
      return <DrawerListSubheader subheader={drawerEntry} />
    case 'actionItem':
      return <DrawerActionItem actionItem={drawerEntry} selected={selected} />
    case 'listItem':
      return <DrawerListItem listItem={drawerEntry} drawerPathSegment={drawerPathSegment} />
    case 'infoItem':
      return <DrawerInfoItem infoItem={drawerEntry} />
    default:
      return null
  }
}

export default React.memo(DrawerListEntry)
