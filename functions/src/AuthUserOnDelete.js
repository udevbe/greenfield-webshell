/**
 * @param {admin.database.Database}database
 * @param {UserRecord}user
 * @return {Promise<void>}
 */
exports.cleanUpUserData = function (database, user) {
  database.ref(`/admins/${user.uid}`).remove()
  database.ref(`/user_roles/${user.uid}`).remove()
  database.ref(`/user_apps/by_user_id/${user.uid}`).remove()
  database.ref(`/users/${user.uid}`).remove()
}
