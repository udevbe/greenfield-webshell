import React from 'react'
import Tab from '@material-ui/core/Tab'
import { useDispatch } from 'react-redux'
import { requestUserSurfaceActive } from '../../store/compositor'

const UserSurfaceTab = React.memo(({ userSurfaceTitle, value }) => {
  const dispatch = useDispatch()

  const requestActive = () => { dispatch(requestUserSurfaceActive(value)) }

  return <Tab label={userSurfaceTitle} onClick={requestActive} value={value} />
})

export default UserSurfaceTab
