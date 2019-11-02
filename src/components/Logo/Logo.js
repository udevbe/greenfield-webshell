'use strict'

// import './style.css'
import React from 'react'
import { withStyles } from '@material-ui/core/es/styles'

const styles = {
  logo: {
    fontFamily: 'Montserrat',
    textAlign: 'center',
    color: '#565656'
  },
  i: {
    color: 'rgba(111, 174, 42, 1);'
  }
}

export default withStyles(styles)(React.memo(
  (props) => {
    const fontSize = props.fontSize ? props.fontSize : '4rem'
    const fontWeight = props.fontWeight ? props.fontWeight : '200'

    return (
      <span className={props.classes.logo} style={{ fontSize, fontWeight }}>
        Greenf<span className={props.classes.i}>i</span>eld
      </span>
    )
  }
))
