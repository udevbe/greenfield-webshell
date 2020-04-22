import Divider from '@material-ui/core/Divider'
import React from 'react'

/**
 * @param {DrawerDivider}divider
 * @return {React.Component}
 * @constructor
 */
const DrawerListDivider = React.memo(({ divider }) => (
  <Divider inset={divider.inset} style={divider.style} />
))

export default DrawerListDivider
