import configureStore from '../store'
import { useMenuItems } from './menuItems'
import grants from './grants'
import locales from './locales'
import { GreenfieldIcon } from '../components/Icons'
import { themes } from './themes'

const config = {
  // firebase_config: {
  //   apiKey: 'AIzaSyBrPVY5tkBYcVUrxZywVDD4gAlHPTdhklw',
  //   authDomain: 'greenfield-app-0.firebaseapp.com',
  //   databaseURL: 'https://greenfield-app-0.firebaseio.com',
  //   projectId: 'greenfield-app-0',
  //   storageBucket: 'greenfield-app-0.appspot.com',
  //   messagingSenderId: '645736998883',
  //   appId: '1:645736998883:web:41c075261b36e1683222d6'
  // },
  firebase_config: {
    apiKey: 'AIzaSyBMng9cUwSyWhS_9JyCJqGKlvfD3NtzoNM',
    authDomain: 'greenfield-dev-38bf7.firebaseapp.com',
    databaseURL: 'https://greenfield-dev-38bf7.firebaseio.com',
    projectId: 'greenfield-dev-38bf7',
    storageBucket: 'greenfield-dev-38bf7.appspot.com',
    messagingSenderId: '479563718289',
    appId: '1:479563718289:web:ec8b3b518c27499943a930',
    measurementId: 'G-84RFF1PNSR'
  },
  firebase_config_dev: {
    apiKey: 'AIzaSyBMng9cUwSyWhS_9JyCJqGKlvfD3NtzoNM',
    authDomain: 'greenfield-dev-38bf7.firebaseapp.com',
    databaseURL: 'https://greenfield-dev-38bf7.firebaseio.com',
    projectId: 'greenfield-dev-38bf7',
    storageBucket: 'greenfield-dev-38bf7.appspot.com',
    messagingSenderId: '479563718289',
    appId: '1:479563718289:web:ec8b3b518c27499943a930',
    measurementId: 'G-84RFF1PNSR'
  },
  firebase_providers: [
    'password',
    'google.com',
    'anonymous'
  ],
  drawer_width: 240,
  appIcon: GreenfieldIcon,
  configureStore,
  useMenuItems,
  locales,
  themes,
  grants
}

export default config
