import React, { useRef, useState } from 'react'
import Activity from '../../containers/Activity'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import InfiniteScroll from 'react-infinite-scroller'
import { useFirebaseConnect } from 'react-redux-firebase'
import { useDispatch, useSelector } from 'react-redux'
import WebAppTile from '../../components/WebStore/WebAppTile'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { push } from 'connected-react-router'

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
}))

const appsListBatchSize = 10

const WebStore = React.memo(() => {
  const dispatch = useDispatch()
  const [webAppTiles, setWebAppTiles] = useState([])

  useFirebaseConnect([{ path: '/apps', storeAs: 'allApps' }])
  const allApps = useSelector(({ firebase }) => firebase.ordered.allApps || [])

  const loadMoreApps = () => {
    const additionalApps = allApps
      .slice(
        webAppTiles.length,
        Math.min(allApps.length, webAppTiles.length + appsListBatchSize)
      )
      .map(({ key, value }, index) => (
        <WebAppTile key={key} index={index} appId={key} app={value} />
      ))
    setWebAppTiles([...webAppTiles, ...additionalApps])
  }

  const classes = useStyles()
  const mainRef = useRef(null)

  const goToMain = () => dispatch(push('/'))
  // TODO i18n
  return (
    <Activity
      pageTitle="Greenfield - Web Store"
      appBarContent={
        <>
          <IconButton onClick={goToMain}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="textPrimary">Web Store</Typography>
          </Breadcrumbs>
        </>
      }
      style={{ maxHeight: '100%' }}
      mainRef={mainRef}
    >
      <Container className={classes.cardGrid} maxWidth={false}>
        <InfiniteScroll
          useWindow={false}
          getScrollParent={() => mainRef.current}
          pageStart={0}
          loadMore={loadMoreApps}
          hasMore={webAppTiles.length !== allApps.length}
          loader={
            <div className="loader" key={0}>
              Loading ...
            </div>
          }
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
