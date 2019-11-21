import React, { useRef, useState } from 'react'
import { injectIntl } from 'react-intl'
import Activity from '../../containers/Activity'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import { makeStyles } from '@material-ui/core/styles'
import { compose } from 'redux'
import InfiniteScroll from 'react-infinite-scroller'
import { useFirebaseConnect } from 'react-redux-firebase'
import { useSelector } from 'react-redux'

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(2)
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  cardMedia: {
    paddingTop: '56.25%' // 16:9
  },
  cardContent: {
    flexGrow: 1
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6)
  }
}))

const cards = [
  {
    key: 1,
    val: {
      media: `https://source.unsplash.com/random?sig=${Math.random()}`,
      name: 'Super Awesome App',
      description: {
        default: 'WebApp intro. Describes what it does and how and why you should use it.',
        en: 'WebApp intro. Describes what it does and how and why you should use it.'
      }
    }
  }, { key: 2, val: null }, { key: 3, val: null }, { key: 4, val: null }, { key: 5, val: null },
  { key: 6, val: null }, { key: 7, val: null }, { key: 8, val: null }, { key: 9, val: null }, { key: 10, val: null },
  { key: 11, val: null }, { key: 12, val: null }, { key: 13, val: null }, { key: 14, val: null },
  { key: 15, val: null }, { key: 16, val: null }, { key: 17, val: null }, { key: 18, val: null },
  { key: 19, val: null }, { key: 20, val: null }
]

const appsListBatchSize = 18

const Webstore = ({ intl }) => {
  const [scrollPos, setScrollPos] = useState(appsListBatchSize)

  useFirebaseConnect([{ path: 'apps', storeAs: 'apps' }])
  const apps = useSelector(state => state.firebase.ordered.apps)

  const classes = useStyles()
  const appsList = cards.slice(0, Math.min(apps.length, scrollPos)).map(({ key, val }) => {
    return (
      <Grid item key={key} xs={12} sm={6} md={4} lg={3} xl={2}>
        <Card className={classes.card}>
          <CardMedia
            className={classes.cardMedia}
            image={`https://source.unsplash.com/random?sig=${key}`}
            title='Image title'
          />
          <CardContent className={classes.cardContent}>
            <Typography gutterBottom variant='h5' component='h2'>
                      Heading
            </Typography>
            <Typography>
              WebApp intro. Describes what it does and how and why you should use it.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size='small' color='primary'>
                      Launch
            </Button>
            <Button size='small' color='primary'>
                      Add
            </Button>
            <Button size='small' color='primary'>
                      More
            </Button>
          </CardActions>
        </Card>
      </Grid>
    )
  })

  const mainRef = useRef(null)
  return (
    <Activity
      title={intl.formatMessage({ id: 'webstore' })}
      style={{ maxHeight: '100%' }}
      mainRef={mainRef}
    >
      <Container
        className={classes.cardGrid}
        maxWidth={false}
      >
        <InfiniteScroll
          useWindow={false}
          getScrollParent={() => mainRef.current}
          pageStart={0}
          loadMore={() => { setScrollPos(scrollPos + appsListBatchSize) }}
          hasMore={apps ? (apps.length > scrollPos) : false}
          loader={<div className='loader' key={0}>Loading ...</div>}
        >
          <Grid container spacing={4}>
            {appsList}
          </Grid>
        </InfiniteScroll>
      </Container>
    </Activity>
  )
}

Webstore.propTypes = {}

export default compose(
  injectIntl
)(Webstore)
