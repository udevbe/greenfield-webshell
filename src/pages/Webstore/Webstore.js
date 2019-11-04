import React from 'react'
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
import { withStyles } from '@material-ui/core/styles'
import { compose } from 'redux'

const styles = theme => ({
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
})

const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const Webstore = ({ intl, classes }) => {
  return (
    <Activity
      title={intl.formatMessage({ id: 'webstore' })}
    >
      <Container
        className={classes.cardGrid}
        maxWidth='false'
      >
        {/* End hero unit */}
        <Grid container spacing={4}>
          {cards.map(card => (
            <Grid item key={card} xs={12} sm={6} md={4} lg={2} xl={1}>
              <Card className={classes.card}>
                <CardMedia
                  className={classes.cardMedia}
                  image='https://source.unsplash.com/random'
                  title='Image title'
                />
                <CardContent className={classes.cardContent}>
                  <Typography gutterBottom variant='h5' component='h2'>
                      Heading
                  </Typography>
                  <Typography>
                      This is a media card. You can use this section to describe the content.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size='small' color='primary'>
                      View
                  </Button>
                  <Button size='small' color='primary'>
                      Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Activity>
  )
}

Webstore.propTypes = {}

export default compose(
  injectIntl,
  withStyles(styles, { withTheme: true })
)(Webstore)
