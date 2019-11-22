import AuthUI from '../../containers/AuthUI/AuthUI'
import React from 'react'
import { Typography } from '@material-ui/core'
import Logo from '../../components/Logo'
import { setDrawerMobileOpen, setDrawerOpen, setDrawerUseMinified } from '../../store/drawer/actions'
import { makeStyles } from '@material-ui/core/styles'
import { useDispatch } from 'react-redux'

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh'
  },
  text: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const SignIn = () => {
  const dispatch = useDispatch()
  dispatch(setDrawerOpen(false))
  dispatch(setDrawerMobileOpen(false))
  dispatch(setDrawerUseMinified(false))

  const classes = useStyles()
  return (
    <div className={classes.wrap}>
      <div className={classes.text}>
        <Logo />
        <Typography variant='h6' color='textSecondary' noWrap>
              The Cloud Desktop
        </Typography>
        <AuthUI />
      </div>
    </div>
  )
}

SignIn.propTypes = {}

export default SignIn
