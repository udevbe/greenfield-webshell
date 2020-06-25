import Avatar from '@material-ui/core/Avatar'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import type { FunctionComponent, ReactNode } from 'react'
import React from 'react'

const AltIconAvatar: FunctionComponent<{ src?: string; icon: ReactNode }> = ({ src, icon, ...rest }) => {
  if (src) {
    return (
      <ListItemAvatar>
        <Avatar src={src} {...rest} />
      </ListItemAvatar>
    )
  } else {
    return (
      <ListItemAvatar>
        <Avatar {...rest}>{icon}</Avatar>
      </ListItemAvatar>
    )
  }
}

export default React.memo(AltIconAvatar)
