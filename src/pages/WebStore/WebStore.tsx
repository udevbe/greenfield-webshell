import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { push } from 'connected-react-router'
import type { ComponentElement, FunctionComponent } from 'react'
import React, { useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { useDispatch, useSelector } from 'react-redux'
import { useFirebaseConnect } from 'react-redux-firebase'
import WebAppTile from '../../components/WebStore/WebAppTile'
import Activity from '../../containers/Activity'

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
}))

const appsListBatchSize = 10

const WebStore: FunctionComponent = () => {
  const dispatch = useDispatch()
  const [webAppTiles, setWebAppTiles] = useState<ComponentElement<any, any>[]>([])

  useFirebaseConnect('/apps')
  const allApps = useSelector((store) => store.firebase.data?.apps ?? {})
  const allAppEntries = Object.entries(allApps)
  const loadMoreApps = () => {
    const additionalApps = allAppEntries
      .slice(webAppTiles.length, Math.min(allAppEntries.length, webAppTiles.length + appsListBatchSize))
      .map(([key, value], index) => <WebAppTile key={key} index={index} appId={key} app={value} />)
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
      mainRef={mainRef}
    >
      <Container className={classes.cardGrid} maxWidth={false}>
        <InfiniteScroll
          useWindow={false}
          getScrollParent={() => mainRef.current}
          pageStart={0}
          loadMore={loadMoreApps}
          hasMore={webAppTiles.length !== allAppEntries.length}
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
}

export default React.memo(WebStore)
