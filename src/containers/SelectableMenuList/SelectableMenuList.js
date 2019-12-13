import ArrowBack from '@material-ui/icons/ArrowBack'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import React, { useState } from 'react'

const SelectableMenuList = React.memo(({ onIndexChange, useMinified, items, index }) => {
  const [state, setState] = useState({})

  const handleNestedItemsClick = item => {
    if (item.nestedItems) {
      const previousItems = state.previousItems ? state.previousItems : []
      const items = item.nestedItems
      const title = item.primaryText

      previousItems.unshift(state.items ? state.items : items)

      setState({ items, previousItems, title, index: item.value })
    } else {
      if (item.value || item.onClick) {
        setState(state => ({ ...state, index: item.value }))
      }
    }
  }

  const handleBackClick = () => {
    const previousItems = state.previousItems ? state.previousItems : []
    const items = previousItems[0] ? previousItems[0] : undefined

    previousItems.shift()

    setState({ items, previousItems })
  }

  const getItem = (item, i) => {
    const { index } = state

    delete item.visible

    if (item !== undefined) {
      if (item.subheader !== undefined) {
        return (
          <div key={i} inset={item.inset} style={item.style}>
            {item.subheader}
          </div>
        )
      } else if (item.divider !== undefined) {
        return <Divider key={i} inset={item.inset} style={item.style} />
      } else {
        return (
          <ListItem
            button
            selected={index && index === item.value}
            key={i}
            onClick={e => {
              onIndexChange(e, item.value)
              handleNestedItemsClick(item)

              if (item.onClick) {
                item.onClick()
              }
            }}
            onMouseDown={e => {
              if (e.button === 1) {
                var win = window.open(`${item.value}`, '_blank')
                win.focus()
              }
            }}
          >
            {item.leftIcon && <ListItemIcon>{item.leftIcon}</ListItemIcon>}

            {!useMinified && <ListItemText primary={item.primaryText} />}

            {item.nestedItems && !useMinified && (
              <ListItemSecondaryAction
                onClick={() => handleNestedItemsClick(item)}
              >
                <IconButton style={{ marginRight: useMinified ? 150 : undefined }}>
                  <KeyboardArrowRight color='action' />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        )
      }
    }

    return null
  }

  const list = state.previousItems && state.previousItems.length > 0 ? state.items : items

  return (
    <List value={index} onChange={onIndexChange}>
      {state.items && state.previousItems && state.previousItems.length > 0 && (
        <div>
          <ListItem
            button
            onClick={() => handleBackClick()}
          >
            <ListItemIcon>
              <ArrowBack />
            </ListItemIcon>
            <ListItemText primary={state.title} />
          </ListItem>
          <Divider />
        </div>
      )}
      {list.filter(item => item.visible !== false).map((item, i) => getItem(item, i))}
    </List>
  )
})

SelectableMenuList.propTypes = {}

export default SelectableMenuList
