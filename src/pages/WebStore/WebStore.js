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
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

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
      description: 'WebApp intro. Describes what it does and how and why you should use it.'
    }
  },
  {
    appId: 2,
    val: {
      media: `https://source.unsplash.com/random?sig=${Math.random()}`,
      name: 'Super Awesome App',
      description: 'WebApp intro. Describes what it does and how and why you should use it.'
    }
  }, {
    appId: 3,
    val: {
      media: `https://source.unsplash.com/random?sig=${Math.random()}`,
      name: 'Super Awesome App',
      description: 'WebApp intro. Describes what it does and how and why you should use it.'
    }
  }
]

const appsListBatchSize = 10

const WebAppTile = React.memo(({ app, index }) => {
  const classes = useWebAppTileStyles()
  const { media, name, description } = app

  const handleAdd = () => {
    // TODO update use application list
  }

  return (
    <Grow in appear style={{ transformOrigin: '0 0 0' }} timeout={{ enter: index * 100 }}>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Card className={classes.card} elevation={5}>
          <CardMedia
            className={classes.cardMedia}
            title={name}
          >
            <Image src={media} />
          </CardMedia>
          <CardContent className={classes.cardContent}>
            <Typography gutterBottom variant='h6' align='center'>
              {name}
            </Typography>
            <Typography gutterBottom vaiant='caption' align='center'>
              {description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size='small' color='primary' onClick={handleAdd} variant='contained'>
                      Add
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grow>
  )
})

const WebStore = React.memo(() => {
  const intl = useIntl()
  const [webAppTiles, setWebAppTiles] = useState([])

  // const publicApps = useSelector(({ firebase }) => firebase.ordered.webstore.public)

  const loadMoreApps = () => {
    const additionalApps = cards
      .slice(webAppTiles.length, Math.min(cards.length, webAppTiles.length + appsListBatchSize))
      .map(({ appId, val }, index) => <WebAppTile key={appId} index={index} app={val} />)
    setWebAppTiles([...webAppTiles, ...additionalApps])
  }

  const classes = useStyles()
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
          hasMore={webAppTiles.length !== cards.length}
          loader={<div className='loader' key={0}>Loading ...</div>}
        >
          <Grid container spacing={4}>
            {webAppTiles}
          </Grid>
        </InfiniteScroll>
      </Container>
    </Activity>
  )
})

WebStore.propTypes = {}

export default WebStore
