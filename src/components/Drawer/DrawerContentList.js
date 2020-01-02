import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import React from 'react'
import { pushDrawerPath, setDrawerMobileOpen } from '../../store/drawer'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

/**
 * @param {DrawerActionItem}actionItem
 * @param {boolean}selected
 * @return {React.Component}
 * @constructor
 */
export const DrawerActionItem = ({ actionItem, selected }) => {
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
}

/**
 * @param {DrawerDivider}divider
 * @return {React.Component}
 * @constructor
 */
export const DrawerListDivider = ({ divider }) => <Divider inset={divider.inset} style={divider.style} />

/**
 * @param {DrawerSubheader}subheader
 * @return {React.Component}
 * @constructor
 */
export const DrawerListSubheader = ({ subheader }) =>
  (<div style={subheader.style}>{subheader.text}</div>)

/**
 * @param {DrawerEntry}drawerEntry
 * @param {string}drawerPathSegment
 * @param {boolean}selected
 * @return {React.Component}
 * @constructor
 */
export const DrawerListEntry = ({ drawerEntry, drawerPathSegment, selected }) => {
  switch (drawerEntry.variant) {
    case 'divider':
      return <DrawerListDivider divider={drawerEntry} />
    case 'subheader':
      return <DrawerListSubheader subheader={drawerEntry} />
    case 'actionItem':
      return <DrawerActionItem actionItem={drawerEntry} selected={selected} />
    case 'listItem':
      return <DrawerListItem listItem={drawerEntry} drawerPathSegment={drawerPathSegment} />
    default:
      return null
  }
}

/**
 * @param {DrawerListItem}listItem
 * @param {string}drawerPathSegment
 * @return {React.Component}
 * @constructor
 */
export const DrawerListItem = ({ listItem, drawerPathSegment }) => {
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
      onClick={() => {
        handleItemPath()
        dispatch(pushDrawerPath(drawerPathSegment))
      }}
    >
      {listItem.leftIcon && <ListItemIcon>{listItem.leftIcon}</ListItemIcon>}
      {!useMinified && open && <ListItemText primary={listItem.text} />}
      {!useMinified && open && (
        <IconButton style={{ marginRight: useMinified ? 150 : undefined }}>
          <KeyboardArrowRight color='action' />
        </IconButton>
      )}
    </ListItem>
  )
}
