import configureStore from '../store'
import getMenuItems from './menuItems'
import grants from './grants'
import locales from './locales'
import { GreenfieldIcon } from '../components/Icons'
import { themes } from './themes'
import routes from './routes'

const config = {
  firebase_config: {
    apiKey: 'AIzaSyBrPVY5tkBYcVUrxZywVDD4gAlHPTdhklw',
    authDomain: 'greenfield-app-0.firebaseapp.com',
    databaseURL: 'https://greenfield-app-0.firebaseio.com',
    projectId: 'greenfield-app-0',
    storageBucket: 'greenfield-app-0.appspot.com',
    messagingSenderId: '645736998883',
    appId: '1:645736998883:web:41c075261b36e1683222d6'
  },
  firebase_config_dev: {
    apiKey: 'AIzaSyCWS_mwT-EuCzxVwVfDEg9rU5oNu6yCHnw',
    authDomain: 'greenfield-app-dev.firebaseapp.com',
    databaseURL: 'https://greenfield-app-dev.firebaseio.com',
    projectId: 'greenfield-app-dev',
    storageBucket: 'greenfield-app-dev.appspot.com',
    messagingSenderId: '211084657743',
    appId: '1:211084657743:web:e80abeba6a9f180bfe163a',
    measurementId: 'G-DYE7DFCBW6'
  },
  firebase_providers: ['password', 'google.com', 'phone', 'anonymous'],
  initial_state: {
    theme: 'light',
    locale: 'en'
  },
  drawer_width: 240,
  appIcon: GreenfieldIcon,
  configureStore,
  getMenuItems,
  locales,
  themes,
  grants,
  routes: routes,
  onAuthStateChanged: undefined,
  notificationsReengagingHours: 48,
  firebaseLoad: () => import('./firebase'),
  getNotifications: (notification, props) => {
    const { history } = props
    return {
      chat: {
        path: 'chats',
        autoClose: 5000,
        // getNotification: () => <div>YOUR CUSTOM NOTIFICATION COMPONENT</div>,
        onClick: () => {
          history.push('/chats')
        },
        ...notification
      }
    }
  }
}

export default config
