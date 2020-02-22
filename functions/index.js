const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const database = admin.database()

const authUserOnCreate = require('./src/AuthUserOnCreate')
const authUserOnDelete = require('./src/AuthUserOnDelete')

const defaultRegion = 'europe-west2'

exports.authUserOnCreateSetDemoUserRole = functions
  .region(defaultRegion)
  .auth.user().onCreate(async user => {
    await authUserOnCreate.setDemoUserRole(database, user)
  })

exports.authUserOnDeleteCleanUpUserData = functions
  .region(defaultRegion)
  .auth.user().onDelete(async user => {
    await authUserOnDelete.cleanUpUserData(database, user)
  })
