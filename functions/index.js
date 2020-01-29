const functions = require('firebase-functions')
const admin = require('firebase-admin')

const defaultRegion = 'europe-west2'

exports.authUserOnCreateSetDemoUserRole = functions
  .region(defaultRegion)
  .auth.user().onCreate(async user => {
    admin.initializeApp()
    const database = admin.database()
    require('./src/AuthUserOnCreate').setDemoUserRole(database, user)
  })

exports.authUserOnDeleteCleanUpUserData = functions
  .region(defaultRegion)
  .auth.user().onDelete(async user => {
    admin.initializeApp()
    const database = admin.database()
    require('./src/AuthUserOnDelete').cleanUpUserData(database, user)
  })
