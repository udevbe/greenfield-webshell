export async function queryAddAppToUser(firebase, appId, uid) {
  return firebase.ref(`/apps_by_user_id/${uid}`).push({ uid, appId })
}

export async function queryRemoveAppFromUser(firebase, uid, linkId) {
  await firebase.ref(`/apps_by_user_id/${uid}/${linkId}`).remove()
}
