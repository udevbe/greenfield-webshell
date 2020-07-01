import { ListItemText } from '@material-ui/core'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import CloseIcon from '@material-ui/icons/Close'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import Flag from '@material-ui/icons/Flag'
import GroupIcon from '@material-ui/icons/Group'
import Keyboard from '@material-ui/icons/Keyboard'
import PublicIcon from '@material-ui/icons/Public'
import Security from '@material-ui/icons/Security'
import SettingsIcon from '@material-ui/icons/SettingsApplications'
import SettingsSystemDaydreamIcon from '@material-ui/icons/SettingsSystemDaydream'
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom'
import type { CSSProperties, ReactElement, ReactNode } from 'react'
import React from 'react'
import { useIntl } from 'react-intl'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { deleteClient } from '../middleware/compositor/actions'
import type { UserShellSurface } from '../store/compositor'
import { useGrant, useIsAdmin, useIsAuthenticated, useUserId } from '../utils/auth'

export interface DrawerDivider {
  variant: 'divider'
  style?: CSSProperties
  visible?: boolean
}

export interface DrawerSubheader {
  variant: 'subheader'
  style?: CSSProperties
  text: string
  visible?: boolean
}

export interface DrawerInfoItem {
  variant: 'infoItem'
  component: ReactElement
  visible: boolean
}

export interface DrawerActionItem {
  variant: 'actionItem'
  path?: string
  onClick?: () => void
  onClickSecondary?: () => void
  text: string
  leftIcon: ReactNode
  rightIcon?: ReactNode
  visible?: boolean
}

export type DrawerEntry = DrawerDivider | DrawerSubheader | DrawerInfoItem | DrawerActionItem | DrawerListItem

export interface DrawerListItem {
  variant: 'listItem'
  path?: string
  onClick?: () => void
  text?: string
  leftIcon?: ReactNode
  entries: { [key: string]: DrawerEntry }
  visible?: boolean
}

export function isDrawerListItem(drawerEntry: DrawerEntry): drawerEntry is DrawerListItem {
  return (drawerEntry as DrawerEntry).variant === 'listItem'
}

export const useMenuItems: (handleSignOut: () => void) => DrawerListItem = (handleSignOut) => {
  const dispatch = useDispatch()
  const intl = useIntl()
  const authorised = useIsAuthenticated()
  const uid = useUserId()
  // FIXME use grants based on db id.
  const webStoreAccess = useGrant(uid, 'read web store applications')
  const isAuthMenu = useSelector((state) => state.dialogs.auth_menu)
  const isAdmin = useIsAdmin(useUserId())
  const addToHomeScreenProposalEvent = useSelector((state) => state.addToHomeScreen.proposalEvent)
  const userSurfacesByAppId: { [key: string]: UserShellSurface[] } = {}
  useSelector(
    ({ compositor }) =>
      Object.values<UserShellSurface>(compositor.surfaces).map(({ id, clientId, title, appId, key }) => ({
        id,
        clientId,
        title,
        appId,
        key,
      })),
    shallowEqual
  ).forEach((userSurface) => {
    const appId =
      !userSurface.appId || userSurface.appId.length === 0 ? `app-${userSurface.clientId}` : userSurface.appId
    const groupedUserSurfaces = userSurfacesByAppId[appId]
    if (groupedUserSurfaces) {
      groupedUserSurfaces.push(userSurface)
    } else {
      userSurfacesByAppId[appId] = [userSurface]
    }
  })

  if (isAuthMenu) {
    const authMenu: DrawerListItem = {
      variant: 'listItem',
      visible: authorised,
      entries: {
        my_account: {
          variant: 'actionItem',
          path: '/my_account',
          text: intl.formatMessage({ id: 'my_account' }),
          leftIcon: <AccountBoxIcon />,
        },
        sign_in: {
          variant: 'actionItem',
          path: '/signin',
          onClick: handleSignOut,
          text: intl.formatMessage({ id: 'sign_out' }),
          leftIcon: <ExitToAppIcon />,
        },
      },
    }
    return authMenu
  }

  const user: DrawerListItem = {
    variant: 'listItem',
    visible: false,
    entries: {
      my_account: {
        variant: 'actionItem',
        path: '/my_account',
        text: intl.formatMessage({ id: 'my_account' }),
        leftIcon: <AccountBoxIcon />,
      },
      sign_in: {
        variant: 'actionItem',
        path: '/signin',
        onClick: handleSignOut,
        text: intl.formatMessage({ id: 'sign_out' }),
        leftIcon: <ExitToAppIcon />,
      },
    },
  }

  const workspace: DrawerListItem = {
    variant: 'listItem',
    visible: authorised,
    text: intl.formatMessage({ id: 'workspace' }),
    leftIcon: <SettingsSystemDaydreamIcon />,
    path: '/workspace',
    // TODO show clients instead of surfaces, show surfaces as tabs of active client
    entries:
      Object.entries(userSurfacesByAppId).length === 0
        ? {
            noRunningApps: {
              variant: 'infoItem',
              component: <ListItemText unselectable="on" secondary="Running applications will appear here." inset />,
              visible: true,
            },
          }
        : Object.entries(userSurfacesByAppId).reduce(
            (nestedMenu, [appId, userSurfaces]) => ({
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
                  const id = userSurfaces[0].clientId
                  dispatch(deleteClient({ id }))
                },
                rightIcon: <CloseIcon />,
              },
            }),
            {}
          ),
  }

  const webStore: DrawerActionItem = {
    variant: 'actionItem',
    visible: authorised && webStoreAccess,
    text: intl.formatMessage({ id: 'web_store' }),
    leftIcon: <PublicIcon />,
    path: '/webstore',
  }

  const _divider0: DrawerDivider = {
    variant: 'divider',
    visible: authorised,
  }

  const administration: DrawerListItem = {
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
        leftIcon: <GroupIcon />,
      },
      roles: {
        variant: 'actionItem',
        path: '/roles',
        visible: isAdmin,
        text: intl.formatMessage({ id: 'roles' }),
        leftIcon: <AccountBoxIcon />,
      },
    },
  }

  const settings: DrawerListItem = {
    variant: 'listItem',
    visible: authorised,
    text: intl.formatMessage({ id: 'settings' }),
    leftIcon: <SettingsIcon />,
    path: '/settings',
    entries: {
      input: {
        variant: 'actionItem',
        text: intl.formatMessage({ id: 'input' }),
        path: '/settings/input',
        leftIcon: <Keyboard />,
      },
      site: {
        variant: 'actionItem',
        text: intl.formatMessage({ id: 'site' }),
        path: '/settings/site',
        leftIcon: <Flag />,
      },
    },
  }

  const install: DrawerActionItem = {
    variant: 'actionItem',
    visible: addToHomeScreenProposalEvent != null,
    onClick: () => addToHomeScreenProposalEvent?.prompt(),
    text: intl.formatMessage({ id: 'install' }),
    leftIcon: <VerticalAlignBottomIcon />,
  }

  // TODO i18n
  return {
    variant: 'listItem',
    visible: authorised,
    entries: {
      user,
      workspace,
      webStore,
      _divider0,
      administration,
      settings,
      install,
    },
  }
}
