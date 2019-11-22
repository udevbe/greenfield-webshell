import firebaseApp from 'firebase/app'
import config from './config'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/messaging'

const firebase = firebaseApp.initializeApp(
  process.env.NODE_ENV !== 'production' ? config.firebase_config_dev : config.firebase_config
)

if (process.env.NODE_ENV === 'development') {
  firebase.firestore().settings({
    host: 'localhost:8080',
    ssl: false
  })
}

export { firebase }
