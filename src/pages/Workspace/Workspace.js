import React, { useRef } from 'react'
import { useIntl } from 'react-intl'
import Activity from '../../containers/Activity'
import UserAppsMenu from '../../containers/UserAppsMenu'

const Workspace = React.memo(() => {
  const intl = useIntl()
  const mainRef = useRef(null)

  return (
    <Activity
      title={intl.formatMessage({ id: 'workspace' })}
      appBarContent={<UserAppsMenu anchorElRef={mainRef} />}
      mainRef={mainRef}
    />
  )
})

Workspace.propTypes = {}

export default Workspace
