import React from 'react'
import { render } from 'react-dom'
import configureStore from './store'
import * as serviceWorker from './utils/serviceWorker'
import App from './containers/App'
import config from './config/config'

const GreenfieldWebShell = () => <App appConfig={{ configureStore, ...config }} />

render(<GreenfieldWebShell />, document.querySelector('#root'))

serviceWorker.register()
