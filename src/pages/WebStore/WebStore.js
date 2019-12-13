import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import Activity from '../../containers/Activity'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { makeStyles } from '@material-ui/core/styles'
import InfiniteScroll from 'react-infinite-scroller'
import Grow from '@material-ui/core/Grow'
import CardMedia from '@material-ui/core/CardMedia'
import Image from '../../components/Image'

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
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6)
  }
}))

const useWebAppTileStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  cardContent: {
    flexGrow: 1
  }
}))

const cards = [
  {
    appId: 1,
    val: {
      media: `https://source.unsplash.com/random?sig=${Math.random()}`,
      name: 'Super Awesome App',
      description: {
        default: 'WebApp intro. Describes what it does and how and why you should use it.',
        en: 'WebApp intro. Describes what it does and how and why you should use it.'
      }
    }
  },
  { appId: 2, val: null }, { appId: 3, val: null }, { appId: 4, val: null }, { appId: 5, val: null },
  { appId: 6, val: null }, { appId: 7, val: null }, { appId: 8, val: null }, { appId: 9, val: null },
  { appId: 10, val: null }, { appId: 11, val: null }, { appId: 12, val: null }, { appId: 13, val: null },
  { appId: 14, val: null }, { appId: 15, val: null }, { appId: 16, val: null }, { appId: 17, val: null },
  { appId: 18, val: null }, { appId: 19, val: null }, { appId: 20, val: null }, { appId: 21, val: null },
  { appId: 22, val: null }, { appId: 23, val: null }, { appId: 24, val: null }, { appId: 25, val: null },
  { appId: 26, val: null }, { appId: 27, val: null }, { appId: 28, val: null }, { appId: 29, val: null },
  { appId: 30, val: null }, { appId: 31, val: null }, { appId: 32, val: null }
]

const appsListBatchSize = 10

const WebAppTile = ({ appId, index }) => {
  const classes = useWebAppTileStyles()
  return (
    <Grow in appear style={{ transformOrigin: '0 0 0' }} timeout={{ enter: index * 100 }}>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Card className={classes.card}>
          <CardMedia
            className={classes.cardMedia}
            title='Image title'
          >
            <Image src={`https://source.unsplash.com/random?sig=${appId}`} />
          </CardMedia>
          <CardContent className={classes.cardContent}>
            <Typography gutterBottom variant='h6' align='center'>
                      Application title
            </Typography>
            <Typography gutterBottom vaiant='caption' align='center'>
                      Short Application description
            </Typography>
          </CardContent>
          {/*<CardActions>*/}
          {/*  <Button size='small' color='primary'>*/}
          {/*            Try*/}
          {/*  </Button>*/}
          {/*  <Button size='small' color='primary'>*/}
          {/*            Add*/}
          {/*  </Button>*/}
          {/*</CardActions>*/}
        </Card>
      </Grid>
    </Grow>
  )
}

const WebStore = () => {
  const intl = useIntl()
  const [webApps, setWebApps] = useState([])

  const classes = useStyles()

  const loadMoreApps = () => {
    const additionalApps = cards.slice(webApps.length, Math.min(cards.length, webApps.length + appsListBatchSize)).map(({ appId, val }, index) =>
      (<WebAppTile appId={appId} key={appId} index={index} />))
    setWebApps([...webApps, ...additionalApps])
  }

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
          loadMore={loadMoreApps}
          hasMore={webApps.length !== cards.length}
          loader={<div className='loader' key={0}>Loading ...</div>}
        >
          <Grid container spacing={4}>
            {webApps}
          </Grid>
        </InfiniteScroll>
      </Container>
    </Activity>
  )
}

WebStore.propTypes = {}

export default WebStore
