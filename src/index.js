import React from 'react'
import { render } from 'react-dom'
import App from './containers/App'
import config from './config/config'

const GreenfieldWebShell = () => <App appConfig={{ ...config }} />

render(<GreenfieldWebShell />, document.querySelector('#root'))
