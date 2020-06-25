import makeStyles from '@material-ui/core/styles/makeStyles'
import React, { FunctionComponent } from 'react'

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

const Logo: FunctionComponent<{
  fontSize?: string
  fontWeight?:
    | number
    | '-moz-initial'
    | 'inherit'
    | 'initial'
    | 'revert'
    | 'unset'
    | 'normal'
    | 'bold'
    | 'bolder'
    | 'lighter'
    | undefined
}> = ({ fontSize = '4rem', fontWeight = 200 }) => {
  const classes = useStyles()
  return (
    <span className={classes.logo} style={{ fontSize, fontWeight }}>
      Greenf<span className={classes.i}>i</span>eld
    </span>
  )
}

export default Logo
