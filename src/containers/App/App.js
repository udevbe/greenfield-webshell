import A2HSProvider from 'a2hs'
import Loadable from 'react-loadable'
import LoadingComponent from '../../components/LoadingComponent'
import React from 'react'
import config from '../../config'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'

const Loading = () => <LoadingComponent />

export const RootAsync = Loadable({
  loader: () => import('../Root'),
  loading: Loading
})

const App = ({ appConfig }) => {
  const store = appConfig.configureStore()
  const configs = { ...config, ...appConfig }
  const { landingPage: LandingPage = false } = configs

  return (
    <A2HSProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            {LandingPage && <Route path="/" exact component={LandingPage} />}
            <Switch>
              <Route>
                <RootAsync appConfig={configs} />
              </Route>
            </Switch>
          </Switch>
        </BrowserRouter>
      </Provider>
    </A2HSProvider>
  )
}

export default App
