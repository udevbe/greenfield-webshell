import { useHistory, useParams } from 'react-router-dom'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { setDrawerMobileOpen } from '../../store/drawer'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import React from 'react'

/**
 * @param {DrawerActionItem}actionItem
 * @param {boolean}selected
 * @return {React.Component}
 * @constructor
 */
const DrawerActionItem = React.memo(({ actionItem, selected }) => {
  const history = useHistory()
  const params = useParams()
  const dispatch = useDispatch()

  const {
    mobileOpen,
    useMinified,
    open
  } = useSelector(({ drawer: { mobileOpen, useMinified, open } }) => ({
    mobileOpen,
    useMinified,
    open
  }), shallowEqual)

  const handleItemPath = () => {
    if (actionItem.path && mobileOpen) {
      dispatch(setDrawerMobileOpen(false))
    }

    if (actionItem.path && actionItem.path !== params.path) {
      history.push(actionItem.path)
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
    </ListItem>
  )
})

export default DrawerActionItem
