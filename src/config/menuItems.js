import AccountBoxIcon from '@material-ui/icons/AccountBox'
import SettingsSystemDaydreamIcon from '@material-ui/icons/SettingsSystemDaydream'
import PublicIcon from '@material-ui/icons/Public'
import GroupIcon from '@material-ui/icons/Group'
import CloseIcon from '@material-ui/icons/Close'
import LanguageIcon from '@material-ui/icons/Language'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import React from 'react'
import Security from '@material-ui/icons/Security'
import SettingsIcon from '@material-ui/icons/SettingsApplications'
import StyleIcon from '@material-ui/icons/Style'
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom'
import allLocales from './locales'
import { themes } from './themes'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { updateTheme } from '../store/themeSource/actions'
import { updateLocale } from '../store/locale/actions'
import { useIntl } from 'react-intl'
import { useGrant, useIsAdmin, useIsAuthenticated, useUserId } from '../utils/auth'
import { useCompositor } from '../contexts/CompositorProvider'

/**
 * @typedef {{
 *   variant: 'divider',
 *   inset: ?string,
 *   style: ?string,
 *   visible: ?boolean
 * }}DrawerDivider
 */
/**
 * @typedef {{
 *   variant: 'subheader',
 *   style: ?string,
 *   text: string,
 *   visible: ?boolean
 * }}DrawerSubheader
 */
/**
 * @typedef {{
 *   variant: 'actionItem'
 *   onClick: ?function():void,
 *   onClickSecondary: ?function():void,
 *   text: string,
 *   leftIcon: Component,
 *   rightIcon: ?Component,
 *   visible: ?boolean
 * }}DrawerActionItem
 */
/**
 * @typedef {{
 *   variant: 'listItem'
 *   path: string,
 *   onClick: ?function():void,
 *   text: string,
 *   leftIcon: Component,
 *   entries: Array<DrawerEntry>,
 *   visible: ?boolean
 * }}DrawerListItem
 */
/**
 * @typedef {DrawerDivider|DrawerSubheader|DrawerActionItem|DrawerListItem}DrawerEntry
 */

export const useMenuItems = handleSignOut => {
  const dispatch = useDispatch()
  const compositor = useCompositor()
  const intl = useIntl()
  const authorised = useIsAuthenticated()
  const uid = useUserId()
  // FIXME use grants based on db id.
  const webstoreAccess = useGrant(uid, 'read web store applications')
  const isAuthMenu = useSelector(({ dialogs }) => !!dialogs.auth_menu)
  const isAdmin = useIsAdmin(useUserId())
  const addToHomeScreenProposalEvent = useSelector(({ addToHomeScreen }) => addToHomeScreen.proposalEvent)
  const userSurfacesByAppId = {}
  useSelector(({ compositor }) =>
    Object.values(compositor.userSurfaces).map(({ id, clientId, title, appId, key }) =>
      ({ id, clientId, title, appId, key })
    ), shallowEqual).forEach(userSurface => {
    const appId = !userSurface.appId || userSurface.appId.length === 0 ? `app-${userSurface.clientId}` : userSurface.appId
    const groupedUserSurfaces = userSurfacesByAppId[appId]
    if (groupedUserSurfaces) {
      groupedUserSurfaces.push(userSurface)
    } else {
      userSurfacesByAppId[appId] = [userSurface]
    }
  })

  if (isAuthMenu) {
    return {
      variant: 'listItem',
      visible: authorised,
      entries: {
        my_account: {
          variant: 'actionItem',
          path: '/my_account',
          text: intl.formatMessage({ id: 'my_account' }),
          leftIcon: <AccountBoxIcon />
        },
        sign_in: {
          variant: 'actionItem',
          path: '/signin',
          onClick: handleSignOut,
          text: intl.formatMessage({ id: 'sign_out' }),
          leftIcon: <ExitToAppIcon />
        }
      }
    }
  }

  return {
    variant: 'listItem',
    visible: authorised,
    entries: {
      user: {
        variant: 'listItem',
        visible: false,
        entries: {
          my_account: {
            variant: 'actionItem',
            path: '/my_account',
            text: intl.formatMessage({ id: 'my_account' }),
            leftIcon: <AccountBoxIcon />
          },
          sign_in: {
            variant: 'actionItem',
            path: '/signin',
            onClick: handleSignOut,
            text: intl.formatMessage({ id: 'sign_out' }),
            leftIcon: <ExitToAppIcon />
          }
        }
      },
      workspace: {
        variant: 'listItem',
        visible: authorised,
        text: intl.formatMessage({ id: 'workspace' }),
        leftIcon: <SettingsSystemDaydreamIcon />,
        path: '/workspace',
        // TODO show clients instead of surfaces, show surfaces as tabs of active client
        entries: Object.entries(userSurfacesByAppId).reduce((nestedMenu, [appId, userSurfaces]) => ({
          ...nestedMenu,
          [appId]: {
            // TODO use client icon as left icon
            visible: authorised,
            variant: 'actionItem',
            text: appId,
            onClick: () => {
              // TODO raise all surfaces of selected client & activate surface that was the last to be active
            },
            onClickSecondary: () => {
              const clientId = userSurfaces[0].clientId
              compositor.actions.closeClient({ id: clientId })
            },
            rightIcon: <CloseIcon />
          }
        }), {})
      },
      webstore: {
        variant: 'actionItem',
        visible: authorised && webstoreAccess,
        text: intl.formatMessage({ id: 'webstore' }),
        leftIcon: <PublicIcon />,
        path: '/webstore'
      },
      _divider0: {
        variant: 'divider',
        visible: authorised
      },
      administration: {
        variant: 'listItem',
        visible: isAdmin,
        text: intl.formatMessage({ id: 'administration' }),
        leftIcon: <Security />,
        entries: {
          users: {
            variant: 'actionItem',
            path: '/users',
            visible: isAdmin,
            text: intl.formatMessage({ id: 'users' }),
            leftIcon: <GroupIcon />
          },
          roles: {
            variant: 'actionItem',
            path: '/roles',
            visible: isAdmin,
            text: intl.formatMessage({ id: 'roles' }),
            leftIcon: <AccountBoxIcon />
          }
        }
      },
      settings: {
        variant: 'listItem',
        visible: authorised,
        text: intl.formatMessage({ id: 'settings' }),
        leftIcon: <SettingsIcon />,
        path: '/settings',
        entries: {
          theme: {
            variant: 'listItem',
            text: intl.formatMessage({ id: 'theme' }),
            leftIcon: <StyleIcon />,
            entries: themes.reduce((menuList, { id, color }) => {
              return {
                ...menuList,
                [id]: {
                  variant: 'actionItem',
                  visible: authorised,
                  text: intl.formatMessage({ id }),
                  onClick: () => dispatch(updateTheme(id)),
                  leftIcon: <StyleIcon style={{ color }} />
                }
              }
            }, {})
          },
          locale: {
            variant: 'listItem',
            text: intl.formatMessage({ id: 'language' }),
            leftIcon: <LanguageIcon />,
            entries: allLocales.reduce((menuList, { locale }) => ({
              ...menuList,
              [locale]: {
                variant: 'actionItem',
                visible: true,
                text: intl.formatMessage({ id: locale }),
                onClick: () => dispatch(updateLocale(locale)),
                leftIcon: <LanguageIcon />
              }
            }), {})
          }
        }
      },
      install: {
        variant: 'actionItem',
        visible: addToHomeScreenProposalEvent != null,
        onClick: () => addToHomeScreenProposalEvent.prompt(),
        text: intl.formatMessage({ id: 'install' }),
        leftIcon: <VerticalAlignBottomIcon />
      }
    }
  }
}
