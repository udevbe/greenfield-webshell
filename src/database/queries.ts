import { ExtendedFirebaseInstance } from 'react-redux-firebase'

export async function queryAddAppToUser(firebase: ExtendedFirebaseInstance, appId: string, uid: string) {
  return firebase.ref(`/apps_by_user_id/${uid}`).push({ uid, appId })
}

export async function queryRemoveAppFromUser(firebase: ExtendedFirebaseInstance, uid: string, linkId: string) {
  await firebase.ref(`/apps_by_user_id/${uid}/${linkId}`).remove()
}
