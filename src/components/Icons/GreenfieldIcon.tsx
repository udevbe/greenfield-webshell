import type { FunctionComponent } from 'react'
import React from 'react'

const GreenfieldIcon: FunctionComponent<{ [x: string]: any }> = (props) => (
  <img src="logo.png" width={22} height={22} {...props} alt="GreenfieldIcon" />
)

export default React.memo(GreenfieldIcon)
