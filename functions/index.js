const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const database = admin.database()

const defaultRegion = 'europe-west2'

exports.authUserOnCreateSetDemoUserRole = functions
  .region(defaultRegion)
  .auth.user().onCreate(async user => {
    require('./src/AuthUserOnCreate').setDemoUserRole(database, user)
  })

exports.authUserOnDeleteCleanUpUserData = functions
  .region(defaultRegion)
  .auth.user().onDelete(async user => {
    require('./src/AuthUserOnDelete').cleanUpUserData(database, user)
  })
