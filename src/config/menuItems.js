import AccountBoxIcon from '@material-ui/icons/AccountBox'
import SettingsSystemDaydreamIcon from '@material-ui/icons/SettingsSystemDaydream'
import PublicIcon from '@material-ui/icons/Public'
import GroupIcon from '@material-ui/icons/Group'
import LanguageIcon from '@material-ui/icons/Language'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import React from 'react'
import Security from '@material-ui/icons/Security'
import SettingsIcon from '@material-ui/icons/SettingsApplications'
import StyleIcon from '@material-ui/icons/Style'
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom'
import allLocales from './locales'
import { themes } from './themes'

const getMenuItems = props => {
  const {
    locale,
    updateTheme,
    updateLocale,
    intl,
    themeSource,
    auth,
    isGranted,
    deferredPrompt,
    isAppInstallable,
    isAppInstalled,
    isAuthMenu,
    handleSignOut
  } = props

  const isAuthorised = auth.isAuthorised

  const themeItems = themes.map(t => {
    return {
      value: undefined,
      visible: true,
      primaryText: intl.formatMessage({ id: t.id }),
      onClick: () => {
        updateTheme(t.id)
      },
      leftIcon: <StyleIcon style={{ color: t.color }} />
    }
  })

  const localeItems = allLocales.map(l => {
    return {
      value: undefined,
      visible: true,
      primaryText: intl.formatMessage({ id: l.locale }),
      onClick: () => {
        updateLocale(l.locale)
      },
      leftIcon: <LanguageIcon />
    }
  })

  if (isAuthMenu) {
    return [
      {
        value: '/my_account',
        primaryText: intl.formatMessage({ id: 'my_account' }),
        leftIcon: <AccountBoxIcon />
      },
      {
        value: '/signin',
        onClick: handleSignOut,
        primaryText: intl.formatMessage({ id: 'sign_out' }),
        leftIcon: <ExitToAppIcon />
      }
    ]
  }

  return [
    {
      visible: isAuthorised,
      primaryText: intl.formatMessage({ id: 'workspace' }),
      primaryTogglesNestedList: false,
      leftIcon: <SettingsSystemDaydreamIcon />,
      value: '/workspace'
    },
    {
      visible: isAuthorised,
      primaryText: intl.formatMessage({ id: 'webstore' }),
      primaryTogglesNestedList: false,
      leftIcon: <PublicIcon />,
      value: '/webstore'
    },
    {
      visible: isAuthorised, // In prod: isGranted('administration'),
      primaryTogglesNestedList: true,
      primaryText: intl.formatMessage({ id: 'administration' }),
      leftIcon: <Security />,
      nestedItems: [
        {
          value: '/users',
          visible: isAuthorised, // In prod: isGranted('read_users'),
          primaryText: intl.formatMessage({ id: 'users' }),
          leftIcon: <GroupIcon />
        },
        {
          value: '/roles',
          visible: isGranted('read_roles'),
          primaryText: intl.formatMessage({ id: 'roles' }),
          leftIcon: <AccountBoxIcon />
        }
      ]
    },
    {
      divider: true,
      visible: isAuthorised
    },
    {
      visible: isAuthorised,
      primaryText: intl.formatMessage({ id: 'settings' }),
      primaryTogglesNestedList: true,
      leftIcon: <SettingsIcon />,
      nestedItems: [
        {
          primaryText: intl.formatMessage({ id: 'theme' }),
          secondaryText: intl.formatMessage({ id: themeSource.source }),
          primaryTogglesNestedList: true,
          leftIcon: <StyleIcon />,
          nestedItems: themeItems
        },
        {
          primaryText: intl.formatMessage({ id: 'language' }),
          secondaryText: intl.formatMessage({ id: locale }),
          primaryTogglesNestedList: true,
          leftIcon: <LanguageIcon />,
          nestedItems: localeItems
        }
      ]
    },
    {
      visible: isAppInstallable && !isAppInstalled,
      onClick: () => {
        deferredPrompt.prompt()
      },
      primaryText: intl.formatMessage({ id: 'install' }),
      leftIcon: <VerticalAlignBottomIcon />
    }
  ]
}

export default getMenuItems
