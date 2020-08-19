import React, { FunctionComponent } from 'react'
import { ScrollbarProps, Scrollbars } from 'react-custom-scrollbars'

const Scrollbar: FunctionComponent<ScrollbarProps> = (props) => {
  const { ...rest } = props

  return <Scrollbars hideTracksWhenNotNeeded {...rest} />
}

export default React.memo(Scrollbar)
