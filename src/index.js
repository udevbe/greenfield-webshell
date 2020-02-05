import React from 'react'
import { render } from 'react-dom'
import App from './containers/App'
import config from './config/config'
import * as serviceWorker from './utils/serviceWorker'

const GreenfieldWebShell = () => <App appConfig={{ ...config }} />

render(<GreenfieldWebShell />, document.querySelector('#root'))

