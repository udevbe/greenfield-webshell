import Divider from '@material-ui/core/Divider'
import React, { FunctionComponent } from 'react'
import { DrawerDivider } from '../../config/menuItems'

const DrawerListDivider: FunctionComponent<{ divider: DrawerDivider }> = ({ divider }) => (
  <Divider style={divider.style} />
)

export default React.memo(DrawerListDivider)
