import IconButton from '@material-ui/core/IconButton'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import { push } from 'connected-react-router'
import React, { FunctionComponent } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import type { DrawerActionItem } from '../../config/menuItems'
import { setDrawerMobileOpen } from '../../store/drawer'

const DrawerAction: FunctionComponent<{ actionItem: DrawerActionItem; selected: boolean }> = ({
  actionItem,
  selected,
}) => {
  const params = useParams<{ path: string }>()
  const dispatch = useDispatch()

  const { mobileOpen, useMinified, open } = useSelector(
    ({ drawer: { mobileOpen, useMinified, open } }) => ({
      mobileOpen,
      useMinified,
      open,
    }),
    shallowEqual
  )

  const handleItemPath = () => {
    if (actionItem.path && mobileOpen) {
      dispatch(setDrawerMobileOpen(false))
    }

    if (actionItem.path && actionItem.path !== params.path) {
      dispatch(push(actionItem.path))
    }
  }

  return (
    <ListItem
      button
      selected={selected}
      onClick={() => {
        handleItemPath()
        if (actionItem.onClick) {
          actionItem.onClick()
        }
      }}
    >
      {actionItem.leftIcon && <ListItemIcon>{actionItem.leftIcon}</ListItemIcon>}
      {!useMinified && open && <ListItemText primary={actionItem.text} />}
      {actionItem.onClickSecondary && (
        <ListItemSecondaryAction onClick={() => actionItem.onClickSecondary?.()}>
          <IconButton style={{ marginRight: useMinified ? 150 : undefined }}>{actionItem.rightIcon}</IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  )
}

export default React.memo(DrawerAction)
