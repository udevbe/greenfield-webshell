import Activity from '../../containers/Activity'
import React from 'react'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import { Link as RouterLink } from 'react-router-dom'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'

const InputSettings = React.memo(() => {
  const link = React.forwardRef((props, ref) =>
    <RouterLink innerRef={ref} {...props} />)

  return (
    <Activity
      pageTitle='Greenfield - Site Settings'
      appBarContent={
        <Breadcrumbs separator={<NavigateNextIcon fontSize='small' />} aria-label='breadcrumb'>
          <Link color='inherit' component={link} to='/settings'>
            Settings
          </Link>
          <Typography color='textPrimary'>
            Site
          </Typography>
        </Breadcrumbs>
      }
      style={{ maxHeight: '100%' }}
    />
  )
})

export default InputSettings
