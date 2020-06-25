import Link from '@material-ui/core/Link'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ReactMarkdown from 'markdown-to-jsx'
import React, { FunctionComponent, ReactNode } from 'react'

const useStyles = makeStyles((theme) => ({
  listItem: {
    marginTop: theme.spacing(1),
  },
}))
const LiComponent: FunctionComponent = (props) => {
  const classes = useStyles()
  return (
    <li className={classes.listItem}>
      <Typography component="span" {...props} />
    </li>
  )
}

const options = {
  overrides: {
    h1: {
      component: Typography,
      props: {
        gutterBottom: true,
        variant: 'h5',
      },
    },
    h2: {
      component: Typography,
      props: { gutterBottom: true, variant: 'h6' },
    },
    h3: {
      component: Typography,
      props: { gutterBottom: true, variant: 'subtitle1' },
    },
    h4: {
      component: Typography,
      props: { gutterBottom: true, variant: 'caption', paragraph: true },
    },
    p: { component: Typography, props: { paragraph: true } },
    a: { component: Link },
    li: {
      component: LiComponent,
    },
  },
}

const MarkDown: FunctionComponent<{ children?: ReactNode }> = (props) => <ReactMarkdown options={options} {...props} />

export default React.memo(MarkDown)
