import PropTypes from 'prop-types'
import React from 'react'
import Context from './Context'

const AppConfigProvider = ({ appConfig, children }) => (
  <Context.Provider value={appConfig}>{children}</Context.Provider>
)

AppConfigProvider.propTypes = {
  children: PropTypes.any,
  appConfig: PropTypes.object.isRequired,
}

export default AppConfigProvider
