import { addDecorator, configure } from '@storybook/react'
import React from 'react'
import { Provider, ReactReduxContext } from 'react-redux'
import FirebaseProvider from 'firekit-provider'
import configureStore from '../src/store'

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/messaging'
import { IntlProvider } from 'react-intl'

const firebase_config_dev = {
  apiKey: 'AIzaSyBMng9cUwSyWhS_9JyCJqGKlvfD3NtzoNM',
  authDomain: 'greenfield-dev-38bf7.firebaseapp.com',
  databaseURL: 'https://greenfield-dev-38bf7.firebaseio.com',
  projectId: 'greenfield-dev-38bf7',
  storageBucket: 'greenfield-dev-38bf7.appspot.com',
  messagingSenderId: '479563718289',
  appId: '1:479563718289:web:ec8b3b518c27499943a930',
  measurementId: 'G-84RFF1PNSR'
}
const firebaseApp = firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(firebase_config_dev)
if (process.env.NODE_ENV === 'development') {
  firebaseApp.firestore().settings({
    host: 'localhost:8080',
    ssl: false
  })
}

addDecorator(storyFn => (
  <IntlProvider locale='en'>
    <Provider store={configureStore()}>
      <FirebaseProvider firebaseApp={firebaseApp} context={ReactReduxContext}>
        {storyFn()}
      </FirebaseProvider>
    </Provider>
  </IntlProvider>
))

// automatically import all files ending in *.stories.js
configure([
  require.context('../src/components', true, /\.stories\.js$/),
  require.context('../src/containers', true, /\.stories\.js$/),
  require.context('../src/pages', true, /\.stories\.js$/)
], module)