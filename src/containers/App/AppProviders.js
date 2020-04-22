import AppConfigProvider from '../../contexts/AppConfigProvider/AppConfigProvider'
import { ThemeProvider } from '@material-ui/styles'
import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import getThemeSource from '../../config/themes'
import { createMuiTheme } from '@material-ui/core'
import { IntlProvider } from 'react-intl'
import locales, { getLocaleMessages } from '../../config/locales'

const AppProviders = ({ appConfig, children }) => {
  const locale = useSelector(({ locale }) => locale, shallowEqual)
  const themeSource = useSelector(({ themeSource }) => themeSource)
  const source = getThemeSource(themeSource, appConfig.themes)
  const theme = createMuiTheme(source)

  const messages = {
    ...getLocaleMessages(locale, locales),
    ...getLocaleMessages(locale, appConfig.locales),
  }

  return (
    <AppConfigProvider appConfig={appConfig}>
      <IntlProvider locale={locale} key={locale} messages={messages}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </IntlProvider>
    </AppConfigProvider>
  )
}

export default AppProviders
