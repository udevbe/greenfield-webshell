import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { pushDrawerPath, setDrawerMobileOpen } from '../../store/drawer'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { ListItemSecondaryAction } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import React from 'react'

/**
 * @param {DrawerListItem}listItem
 * @param {string}drawerPathSegment
 * @return {React.Component}
 * @constructor
 */
const DrawerListItem = ({ listItem, drawerPathSegment }) => {
  const dispatch = useDispatch()
  const params = useParams()
  const history = useHistory()
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
    if (listItem.path && mobileOpen) {
      dispatch(setDrawerMobileOpen(false))
    }

    if (listItem.path && listItem.path !== params.path) {
      history.push(listItem.path)
    }
  }

  return (
    <ListItem
      button
      onClick={() => { handleItemPath() }}
    >
      {listItem.leftIcon && <ListItemIcon>{listItem.leftIcon}</ListItemIcon>}
      {!useMinified && open && <ListItemText primary={listItem.text} />}
      {!useMinified && open && (
        <ListItemSecondaryAction onClick={() => dispatch(pushDrawerPath(drawerPathSegment))}>
          <IconButton style={{ marginRight: useMinified ? 150 : undefined }}>
            <KeyboardArrowRight color='action' />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  )
}

export default DrawerListItem
