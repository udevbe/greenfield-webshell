import { createMuiTheme } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import React, { FunctionComponent } from 'react'
import { IntlProvider } from 'react-intl'
import { shallowEqual, useSelector } from 'react-redux'
import { AppConfig } from '../../config/config'
import locales, { getLocaleMessages } from '../../config/locales'
import getThemeSource from '../../config/themes'
import AppConfigProvider from '../../contexts/AppConfigProvider/AppConfigProvider'

const AppProviders: FunctionComponent<{ appConfig: AppConfig }> = ({ appConfig, children }) => {
  const locale = useSelector((store) => store.locale.locale, shallowEqual)
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
