import React, { FunctionComponent } from 'react'
import { DrawerSubheader } from '../../config/menuItems'

const DrawerListSubheader: FunctionComponent<{ subheader: DrawerSubheader }> = ({ subheader }) => (
  <div style={subheader.style}>{subheader.text}</div>
)

export default React.memo(DrawerListSubheader)
