import React, { Component } from 'react'
import { render } from 'react-dom'
import configureStore from './store'
import * as serviceWorker from './utils/serviceWorker'
import App from './containers/App'
import config from './config/config'
import A2HSProvider from 'a2hs'

class Demo extends Component {
  render () {
    return (
      <A2HSProvider>
        <App appConfig={{ configureStore, ...config }} />
      </A2HSProvider>
    )
  }
}

render(<Demo />, document.querySelector('#root'))

serviceWorker.register()
