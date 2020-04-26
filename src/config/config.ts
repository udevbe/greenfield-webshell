import type { ReactNode } from 'react'
import configureStore from '../store'
import type { DrawerListItem } from './menuItems'
import { useMenuItems } from './menuItems'
import grants from './grants'
import locales from './locales'
import { GreenfieldIcon } from '../components/Icons'
import type { Theme } from './themes'
import { themes } from './themes'

export interface AppConfig {
  grants: string[]
  themes: Theme[]
  appIcon: ReactNode
  locales: any
  firebase_config_dev: {
    storageBucket: string
    apiKey: string
    messagingSenderId: string
    appId: string
    projectId: string
    measurementId: string
    databaseURL: string
    authDomain: string
  }
  useMenuItems: (handleSignOut: () => void) => DrawerListItem
  configureStore: any
  firebase_config: {
    storageBucket: string
    apiKey: string
    messagingSenderId: string
    appId: string
    projectId: string
    measurementId: string
    databaseURL: string
    authDomain: string
  }
  firebase_providers: string[]
  drawer_width: number
}
const config: AppConfig = {
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
    apiKey: 'AIzaSyDHi2ozsjYZvAk_4cc5ZbCbLjlE-fWnc9Q',
    authDomain: 'greenfield-preview.firebaseapp.com',
    databaseURL: 'https://greenfield-preview.firebaseio.com',
    projectId: 'greenfield-preview',
    storageBucket: 'greenfield-preview.appspot.com',
    messagingSenderId: '213447278801',
    appId: '1:213447278801:web:56460a58be75b16168c5f0',
    measurementId: 'G-V42XC9PBP5',
  },
  firebase_config_dev: {
    apiKey: 'AIzaSyBMng9cUwSyWhS_9JyCJqGKlvfD3NtzoNM',
    authDomain: 'greenfield-dev-38bf7.firebaseapp.com',
    databaseURL: 'https://greenfield-dev-38bf7.firebaseio.com',
    projectId: 'greenfield-dev-38bf7',
    storageBucket: 'greenfield-dev-38bf7.appspot.com',
    messagingSenderId: '479563718289',
    appId: '1:479563718289:web:ec8b3b518c27499943a930',
    measurementId: 'G-84RFF1PNSR',
  },
  firebase_providers: ['password', 'google.com', 'anonymous'],
  drawer_width: 240,
  appIcon: GreenfieldIcon,
  configureStore,
  useMenuItems,
  locales,
  themes,
  grants,
}

export default config
