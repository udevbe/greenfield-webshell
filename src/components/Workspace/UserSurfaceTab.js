import React from 'react'
import Tab from '@material-ui/core/Tab'
import { useDispatch } from 'react-redux'
import { requestUserSurfaceActiveAction } from '../../middleware/compositor/actions'
import Typography from '@material-ui/core/Typography'

const UserSurfaceTab = React.memo(({ userSurfaceTitle, value }) => {
  const dispatch = useDispatch()
  const requestActive = () => { dispatch(requestUserSurfaceActiveAction(value)) }
  return (
    <Tab
      label={
        <>
          <Typography>{userSurfaceTitle}</Typography>
        </>
      }
      onClick={requestActive}
      value={value}
    />)
})

export default UserSurfaceTab
