import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import Activity from '../../containers/Activity'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import InfiniteScroll from 'react-infinite-scroller'
import { useFirebaseConnect } from 'react-redux-firebase'
import { useSelector } from 'react-redux'
import WebAppTile from '../../components/WebStore/WebAppTile'

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

const appsListBatchSize = 10

const WebStore = React.memo(() => {
  const intl = useIntl()
  const [webAppTiles, setWebAppTiles] = useState([])

  useFirebaseConnect([{ path: '/apps' }])
  const allApps = useSelector(({ firebase }) => firebase.ordered.apps || [])

  const loadMoreApps = () => {
    const additionalApps = allApps
      .slice(webAppTiles.length, Math.min(allApps.length, webAppTiles.length + appsListBatchSize))
      .map(({ key, value }, index) => <WebAppTile key={key} index={index} appId={key} app={value} />)
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
          hasMore={webAppTiles.length !== allApps.length}
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
