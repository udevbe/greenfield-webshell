import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'

const useStyles = makeStyles({
  logo: {
    fontFamily: 'Montserrat',
    textAlign: 'center',
    color: '#565656',
  },
  i: {
    color: 'rgba(111, 174, 42, 1);',
  },
})

export default ({ fontSize = '4rem', fontWeight = '200' }) => {
  const classes = useStyles()
  return (
    <span className={classes.logo} style={{ fontSize, fontWeight }}>
      Greenf<span className={classes.i}>i</span>eld
    </span>
  )
}
