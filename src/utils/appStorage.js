/**
 * @param firebase
 * @param {string}storageURL
 * @return {Promise<*>}
 */
export async function fetchAppStorageProperty(firebase, storageURL) {
  const downloadableStorageURL = await firebase
    .storage()
    .refFromURL(storageURL)
    .getDownloadURL()
  return new Promise((resolve, reject) => {
    const xhr = new window.XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === window.XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          resolve(xhr.responseText)
        } else {
          // TODO sentry.io
          console.error(
            `Could not fetch app storage application. ${xhr.status}: ${xhr.statusText}`
          )
          reject(new Error('Could not fetch app storage.'))
        }
      }
    }
    xhr.open('GET', downloadableStorageURL)
    xhr.send()
  })
}
