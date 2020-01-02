import React, { useRef } from 'react'
import { useIntl } from 'react-intl'
import Activity from '../../containers/Activity'
import UserAppsMenu from '../../containers/UserAppsMenu'
import { useSelector } from 'react-redux'
import UserSurfaceArea from '../../containers/Workspace/UserSurfaceArea'

const Workspace = () => {
  const intl = useIntl()
  const mainRef = useRef(null)
  const compositorInitialized = useSelector(({ compositor }) => compositor.initialized)

  return (
    <Activity
      isLoading={!compositorInitialized}
      title={intl.formatMessage({ id: 'workspace' })}
      appBarContent={<UserAppsMenu anchorElRef={mainRef} />}
      mainRef={mainRef}
    >
      <UserSurfaceArea />
    </Activity>
  )
}

export default Workspace
