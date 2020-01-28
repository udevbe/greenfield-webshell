const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

// Gives every new user the 'Demo User' role.
exports.setDemoUserRole = functions
  .region('europe-west2')
  .auth.user().onCreate(async user => {
    const rolesSnapshot = await admin.database().ref('/roles').once('value')
    const demoUserRole = Object.entries(rolesSnapshot.val()).find(([_, role]) => role.name === 'Demo User') || null
    if (demoUserRole) {
      await admin.database().ref(`/user_roles/${user.uid}/${demoUserRole[0]}`).set(true)
    }
  })

// Clean up entries tied to user.
exports.cleanUpUser = functions
  .region('europe-west2')
  .auth.user().onDelete(async user => {
    await admin.database().ref(`/admins/${user.uid}`).remove()
    await admin.database().ref(`/user_roles/${user.uid}`).remove()
    await admin.database().ref(`/user_apps/by_user_id/${user.uid}`).remove()
    await admin.database().ref(`/users/${user.uid}`).remove()
  })
