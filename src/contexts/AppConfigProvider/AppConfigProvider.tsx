import PropTypes from 'prop-types'

import type { ReactNode } from 'react'
import React from 'react'
import type { AppConfig } from '../../config/config'
import Context from './Context'

const AppConfigProvider = ({
  appConfig,
  children,
}: {
  appConfig: AppConfig
  children?: ReactNode
}) => <Context.Provider value={appConfig}>{children}</Context.Provider>

AppConfigProvider.propTypes = {
  children: PropTypes.any,
  appConfig: PropTypes.object.isRequired,
}

export default AppConfigProvider
