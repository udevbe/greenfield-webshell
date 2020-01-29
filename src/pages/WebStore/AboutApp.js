import React from 'react'
import Activity from '../../containers/Activity'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { useHistory } from 'react-router'
import Link from '@material-ui/core/Link'
import { Link as RouterLink, useParams } from 'react-router-dom'

const AboutApp = React.memo(() => {
  const history = useHistory()
  const { appid } = useParams()

  const goToWebStore = () => history.push('/webstore')
  const link = React.forwardRef((props, ref) =>
    <RouterLink innerRef={ref} {...props} />)
  // TODO i18n
  return (
    <Activity
      pageTitle={`Greenfield - Web Store - ${appid}`}
      appBarContent={
        <>
          <IconButton onClick={goToWebStore}>
            <ArrowBackIcon fontSize='large' />
          </IconButton>
          <Breadcrumbs aria-label='breadcrumb'>
            <Link underline='hover' color='inherit' component={link} to='/webstore'>
              Web Store
            </Link>
            <Typography color='textPrimary'>
              {appid}
            </Typography>
          </Breadcrumbs>
        </>
      }
      style={{ maxHeight: '100%' }}
    >
      <Container>
      </Container>
    </Activity>
  )
})

export default AboutApp
