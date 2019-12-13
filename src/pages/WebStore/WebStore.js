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
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { useUserId } from '../../utils/auth'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { notifyInfo, notifySuccess } from '../../utils/notify'
import CircularProgress from '@material-ui/core/CircularProgress'

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
    flexDirection: 'column',
    position: 'relative'
  },
  cardContent: {
    flexGrow: 1
  },
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 'auto',
    left: 'auto',
    color: 'black',
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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

const WebAppTile = React.memo(({ appId, app, index }) => {
  const { media, name, description } = app
  const [busy, setBusy] = useState(false)
  const firebase = useFirebase()
  const uid = useUserId()

  useFirebaseConnect([{ path: `/user_apps/${uid}/${appId}` }])
  const userHasApp = useSelector(({ firebase }) => {
    if (firebase.data.user_apps && firebase.data.user_apps[uid]) {
      return firebase.data.user_apps[uid][appId] || false
    }
  })

  const manageApp = async (install) => {
    try {
      const timer = setTimeout(() => setBusy(true), 500)
      await firebase.ref(`/user_apps/${uid}/${appId}`).set(install)
      clearTimeout(timer)
      install ? notifySuccess('Application added.') : notifyInfo('Application removed.')
    } catch (e) {
      // TODO error in sentry.io
      // TODO intl
      toast.error(<Typography variant='body1'>Could not add application. Try again later.</Typography>)
    }
    setBusy(false)
  }

  const classes = useWebAppTileStyles()
  return (
    <Grow in appear style={{ transformOrigin: '0 0 0' }} timeout={{ enter: index * 100 }}>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={2}>
        <Card className={classes.card} elevation={5}>
          {busy && <div className={classes.overlay}><CircularProgress /></div>}
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
            {
              !userHasApp &&
              <Button
                disabled={busy}
                size='large'
                color='primary'
                onClick={() => manageApp(true)}
                variant='contained'
              >
               Add
                </Button>
            }
            {
              userHasApp &&
              <>
                  <Button
                    disabled={busy}
                    size='large'
                    color='primary'
                    variant='contained'
                  >
                      Launch
                  </Button>
                  <Button
                    disabled={busy}
                    size='large'
                    color='primary'
                    onClick={() => manageApp(false)}
                    variant='contained'
                  >
                    Remove
                  </Button>
                </>
            }
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
      .map(({ appId, val }, index) => <WebAppTile key={appId} index={index} appId={appId} app={val} />)
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
