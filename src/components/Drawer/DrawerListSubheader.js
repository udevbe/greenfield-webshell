import React from 'react'

/**
 * @param {DrawerSubheader}subheader
 * @return {React.Component}
 * @constructor
 */
const DrawerListSubheader = React.memo(({ subheader }) => (
  <div style={subheader.style}>{subheader.text}</div>
))

export default DrawerListSubheader
