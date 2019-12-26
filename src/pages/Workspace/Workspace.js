import React, { useRef } from 'react'
import { useIntl } from 'react-intl'
import Activity from '../../containers/Activity'
import UserAppsMenu from '../../containers/UserAppsMenu'
import CompositorProvider from '../../contexts/CompositorProvider'
import { useSelector } from 'react-redux'
import UserSurfaceArea from '../../containers/Workspace/UserSurfaceArea'

const Workspace = () => {
  const intl = useIntl()
  const mainRef = useRef(null)
  const compositorInitialized = useSelector(({ compositor }) => compositor.initialized)

  return (
    <CompositorProvider>
      <Activity
        isLoading={!compositorInitialized}
        title={intl.formatMessage({ id: 'workspace' })}
        appBarContent={<UserAppsMenu anchorElRef={mainRef} />}
        mainRef={mainRef}
      >
        <UserSurfaceArea />
      </Activity>
    </CompositorProvider>
  )
}

export default Workspace
