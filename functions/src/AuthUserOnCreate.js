/**
 * @param {admin.database.Database}database
 * @param {UserRecord}user
 * @return {Promise<void>}
 */
exports.setDemoUserRole = async function (database, user) {
  const rolesSnapshot = await database.ref('/roles').once('value')
  const demoUserRole = Object.entries(rolesSnapshot.val()).find(([_, role]) => role.name === 'Demo User') || null
  if (demoUserRole) {
    database.ref(`/user_roles/${user.uid}/${demoUserRole[0]}`).set(true)
  }
}
