import AppConfigProvider from '../../contexts/AppConfigProvider/Provider'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import { ThemeProvider } from '@material-ui/styles'
import React from 'react'
import { useSelector } from 'react-redux'
import getThemeSource from '../../config/themes'
import { createMuiTheme } from '@material-ui/core'
import A2HSProvider from 'a2hs'
import MomentUtils from '@date-io/moment'
import { IntlProvider } from 'react-intl'

const AppProviders = ({ appConfig, children }) => {
  const locale = useSelector(({ locale }) => locale)
  const themeSource = useSelector(({ themeSource }) => themeSource)
  const source = getThemeSource(themeSource, appConfig.themes)
  const theme = createMuiTheme(source)

  return (
    <AppConfigProvider appConfig={appConfig}>
      <IntlProvider locale={locale}>
        <A2HSProvider>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <ThemeProvider theme={theme}>
              {children}
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </A2HSProvider>
      </IntlProvider>
    </AppConfigProvider>
  )
}

export default AppProviders
