import { ListItemSecondaryAction } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import { push } from 'connected-react-router'
import React, { FunctionComponent } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { DrawerListItem } from '../../config/menuItems'
import { pushDrawerPath, setDrawerMobileOpen } from '../../store/drawer'

const DrawerList: FunctionComponent<{ listItem: DrawerListItem; drawerPathSegment: string }> = ({
  listItem: { path, leftIcon, text },
  drawerPathSegment,
}) => {
  const dispatch = useDispatch()
  const params = useParams<{ path: string }>()
  const { mobileOpen, useMinified, open } = useSelector(
    ({ drawer: { mobileOpen, useMinified, open } }) => ({
      mobileOpen,
      useMinified,
      open,
    }),
    shallowEqual
  )

  const handleItemPath = () => {
    if (path && mobileOpen) {
      dispatch(setDrawerMobileOpen(false))
    }

    if (path && path !== params.path) {
      dispatch(push(path))
    }
  }

  return (
    <ListItem
      button
      onClick={() => {
        handleItemPath()
      }}
    >
      {leftIcon && <ListItemIcon>{leftIcon}</ListItemIcon>}
      {!useMinified && open && <ListItemText primary={text} />}
      {!useMinified && open && (
        <ListItemSecondaryAction onClick={() => dispatch(pushDrawerPath(drawerPathSegment))}>
          <IconButton style={{ marginRight: useMinified ? 150 : undefined }}>
            <KeyboardArrowRight color="action" />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  )
}

export default React.memo(DrawerList)
