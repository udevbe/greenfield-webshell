import type { FunctionComponent } from 'react'
import React from 'react'
import Tab from '@material-ui/core/Tab'
import { useDispatch } from 'react-redux'
import { requestSurfaceActive } from '../../middleware/compositor/actions'
import Typography from '@material-ui/core/Typography'
import { UserShellSurfaceKey } from '../../middleware/compositor/CompositorApi'
import type { UserShellSurface } from '../../store/compositor'

const UserSurfaceTab: FunctionComponent<{
  surface: Pick<UserShellSurface, 'title' | 'key'>
  value: UserShellSurfaceKey
}> = ({ surface, value }) => {
  const dispatch = useDispatch()
  const requestActive = () => {
    dispatch(requestSurfaceActive(surface))
  }
  return (
    <Tab
      label={
        <>
          <Typography>{surface.title}</Typography>
        </>
      }
      onClick={requestActive}
      value={value}
    />
  )
}

export default React.memo(UserSurfaceTab)
