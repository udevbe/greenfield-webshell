import Activity from '../../containers/Activity'
import type { FunctionComponent } from 'react'
import React, { ComponentProps } from 'react'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import { Link as RouterLink } from 'react-router-dom'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import {
  Container,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core'
import ListItem from '@material-ui/core/ListItem'
import List from '@material-ui/core/List'
import StyleIcon from '@material-ui/icons/Style'
import Divider from '@material-ui/core/Divider'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import { updateTheme } from '../../store/themeSource'
import { useDispatch, useSelector } from 'react-redux'
import { push } from 'connected-react-router'

import { themes } from '../../config/themes'
import allLocales from '../../config/locales'
import { useIntl } from 'react-intl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import LanguageIcon from '@material-ui/icons/Language'
import { updateLocale } from '../../store/locale'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(3),
  },
  wrapIcon: {
    verticalAlign: 'middle',
  },
}))

const SettingsLink = React.forwardRef<HTMLElement, ComponentProps<any>>(
  (props, ref) => <RouterLink to="/settings" innerRef={ref} {...props} />
)

const InputSettings: FunctionComponent = () => {
  const intl = useIntl()
  const dispatch = useDispatch()

  const currentThemeId = useSelector((state) => state.themeSource.themeId)
  const onThemeChange = (event: { target: { value: string } }) =>
    dispatch(updateTheme({ themeId: event.target.value, nightMode: false }))

  const currentLocale = useSelector((state) => state.locale.locale)
  const onLocaleChange = (event: { target: { value: string } }) =>
    dispatch(updateLocale(event.target.value))

  const goToSettings = () => dispatch(push('/settings'))

  const classes = useStyles()
  // TODO i18n
  return (
    <Activity
      pageTitle="Greenfield - Site Settings"
      appBarContent={
        <>
          <IconButton onClick={goToSettings}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link underline="hover" color="inherit" component={SettingsLink}>
              Settings
            </Link>
            <Typography color="textPrimary">Site</Typography>
          </Breadcrumbs>
        </>
      }
    >
      <Container>
        <List>
          <ListItem>
            <ListItemIcon>
              <StyleIcon />
            </ListItemIcon>
            <ListItemText primary="Theme" />
          </ListItem>
          <Divider variant="fullWidth" />
          <ListItem>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">
                {intl.formatMessage({ id: 'theme' })}
              </FormLabel>
              <RadioGroup
                aria-label="theme"
                name="theme"
                value={currentThemeId}
                onChange={onThemeChange}
              >
                {themes.map(({ id, color }) => (
                  <FormControlLabel
                    key={id}
                    value={id}
                    control={<Radio />}
                    label={
                      <Typography>
                        <StyleIcon
                          style={{ color }}
                          className={classes.wrapIcon}
                        />{' '}
                        {intl.formatMessage({ id })}
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText primary="Site Language" />
          </ListItem>
          <Divider variant="fullWidth" />
          <ListItem>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">
                {intl.formatMessage({ id: 'language' })}
              </FormLabel>
              <RadioGroup
                aria-label="locale"
                name="locale"
                value={currentLocale}
                onChange={onLocaleChange}
              >
                {allLocales.map(({ locale }) => (
                  <FormControlLabel
                    key={locale}
                    value={locale}
                    control={<Radio />}
                    label={
                      <Typography>
                        {intl.formatMessage({
                          id: locale,
                        })}
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </ListItem>
        </List>
      </Container>
    </Activity>
  )
}

export default React.memo(InputSettings)
