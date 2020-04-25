import Activity from '../../containers/Activity'
import type { ComponentProps, FunctionComponent } from 'react'
import React, { useRef, useState } from 'react'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'
import { Link as RouterLink } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import Container from '@material-ui/core/Container'
import Slider from '@material-ui/core/Slider'
import ListItem from '@material-ui/core/ListItem'
import { makeStyles } from '@material-ui/core/styles'
import Mouse from '@material-ui/icons/Mouse'
import { ListItemIcon, ListItemText } from '@material-ui/core'
import { Keyboard } from '@material-ui/icons'
import type { DefaultRootState } from 'react-redux'
import { useDispatch, useSelector } from 'react-redux'
import { updateUserShellConfiguration } from '../../store/compositor'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import IconButton from '@material-ui/core/IconButton'
import { push } from 'connected-react-router'
import type { nrmlvo } from 'compositor-module'

const useStyles = makeStyles((theme) => ({
  spacer: {
    marginTop: theme.spacing(6),
  },
}))

const SettingsLink = React.forwardRef<HTMLElement, ComponentProps<any>>(
  (props, ref) => <RouterLink to="/settings" innerRef={ref} {...props} />
)

const InputSettings: FunctionComponent = () => {
  const dispatch = useDispatch()

  const nrmlvoEntries: nrmlvo[] = useSelector(
    (state) => state.compositor.seat.keyboard.nrmlvoEntries
  )
  const defaultNrmlvo = useSelector(
    (state) => state.compositor.seat.keyboard.defaultNrmlvo
  )
  const isInitialized = useSelector(({ compositor }) => compositor.initialized)

  const keyboardLayoutNames = useRef<string[]>([])
  keyboardLayoutNames.current = isInitialized
    ? nrmlvoEntries.map((nrmlvo) => nrmlvo.name)
    : []
  const keyboardLayoutName = useSelector((state: DefaultRootState) => {
    if (isInitialized) {
      return (
        state.compositor.configuration?.keyboardLayoutName ?? defaultNrmlvo.name
      )
    } else {
      return ''
    }
  })
  const handleKeyboardLayoutChange = (_: any, value: string | null) => {
    if (value) {
      dispatch(updateUserShellConfiguration({ keyboardLayoutName: value }))
    }
  }

  const scrollFactor = useSelector(
    (state: DefaultRootState) =>
      state.compositor.configuration?.scrollFactor ?? 1
  )
  const [scrollSpeed, setScrollSpeed] = useState(scrollFactor * 100)
  const handleScrollSpeedUpdate = (value: number) => {
    setScrollSpeed(value)
  }
  const handleScrollSpeedCommit = () => {
    dispatch(updateUserShellConfiguration({ scrollFactor: scrollSpeed / 100 }))
  }
  const handleScrollSpeedLabelUpdate = (value: number) => `${value}%`

  const goToSettings = () => dispatch(push('/settings'))

  const classes = useStyles()
  // TODO i18n
  return (
    <Activity
      pageTitle="Greenfield - Input Settings"
      isLoading={!isInitialized}
      appBarContent={
        <>
          <IconButton onClick={goToSettings}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" component={SettingsLink}>
              Settings
            </Link>
            <Typography color="textPrimary">Input</Typography>
          </Breadcrumbs>
        </>
      }
    >
      <Container>
        <List>
          <ListItem>
            <ListItemIcon>
              <Keyboard />
            </ListItemIcon>
            <ListItemText primary="Keyboard" />
          </ListItem>
          <Divider variant="fullWidth" />
          <ListItem>
            <Autocomplete
              loading={!isInitialized}
              id="keyboard-layout"
              disableClearable
              options={keyboardLayoutNames.current}
              defaultValue={keyboardLayoutName}
              style={{ width: '100%' }}
              onChange={handleKeyboardLayoutChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Layout"
                  variant="standard"
                  fullWidth
                />
              )}
            />
          </ListItem>

          <div className={classes.spacer} />
          <ListItem>
            <ListItemIcon>
              <Mouse />
            </ListItemIcon>
            <ListItemText primary="Mouse" />
          </ListItem>
          <Divider variant="fullWidth" />
          <ListItem
            style={{
              paddingBottom: 0,
            }}
          >
            <Typography
              id="scroll-speed-slider"
              gutterBottom={false}
              variant="caption"
              color="textSecondary"
            >
              Scroll Speed
            </Typography>
          </ListItem>
          <ListItem
            style={{
              paddingTop: 0,
            }}
          >
            <Slider
              min={1}
              max={300}
              step={1}
              aria-labelledby="scroll-speed-slider"
              valueLabelDisplay="on"
              value={scrollSpeed}
              valueLabelFormat={(value) => handleScrollSpeedLabelUpdate(value)}
              onChange={(_, value) => {
                // @ts-ignore
                handleScrollSpeedUpdate(value)
              }}
              onChangeCommitted={() => handleScrollSpeedCommit()}
            />
          </ListItem>

          <div className={classes.spacer} />
        </List>
      </Container>
    </Activity>
  )
}

export default React.memo(InputSettings)
