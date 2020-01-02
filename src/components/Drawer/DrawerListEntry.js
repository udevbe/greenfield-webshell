import DrawerListDivider from './DrawerListDivider'
import DrawerListSubheader from './DrawerListSubheader'
import DrawerActionItem from './DrawerActionItem'
import React from 'react'
import DrawerListItem from './DrawerListItem'

/**
 * @param {DrawerEntry}drawerEntry
 * @param {string}drawerPathSegment
 * @param {boolean}selected
 * @return {React.Component}
 * @constructor
 */
const DrawerListEntry = React.memo(({ drawerEntry, drawerPathSegment, selected }) => {
  switch (drawerEntry.variant) {
    case 'divider':
      return <DrawerListDivider divider={drawerEntry} />
    case 'subheader':
      return <DrawerListSubheader subheader={drawerEntry} />
    case 'actionItem':
      return <DrawerActionItem actionItem={drawerEntry} selected={selected} />
    case 'listItem':
      return <DrawerListItem listItem={drawerEntry} drawerPathSegment={drawerPathSegment} />
    default:
      return null
  }
})

export default DrawerListEntry
