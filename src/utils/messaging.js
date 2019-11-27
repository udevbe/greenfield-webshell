import React from 'react'
import { toast } from 'react-toastify'
import NotificationToast from '../components/Notifications/NotificationToast'
import UpdateToast from '../components/Notifications/UpdateToast'

let updateMessageShown = false

const initializeMessaging = (location, initMessagingCb, firebase, appConfig, history, skipIfNoPermission = false) => {
  const firebaseApp = firebase.app
  const auth = firebase.auth
  firebaseApp.database().ref(`disable_notifications/${auth.uid}`)
    .once('value', snap => {
      if (snap.val()) {
        console.log('Notifications disabled by user')
      } else if (skipIfNoPermission && ('Notification' in window && window.Notification.permission !== 'granted')) {
        console.log('No permissions for Notifications')
      } else {
        console.log('Notifications initialized')
        initMessagingCb(
          firebaseApp,
          token => firebaseApp.database().ref(`notification_tokens/${auth.uid}/${token}`).set(true),
          payload => { handleMessageReceived(location, appConfig, history, payload) }
        )
      }
    })
}

const handleMessageReceived = (location, appConfig, history, payload) => {
  const notification = payload.notification
  const pathname = location ? location.pathname : ''
  const tag = payload.notification ? payload.notification.tag : ''
  const notifications = appConfig.getNotifications(notification, history)
  const notificationData = notifications[tag] ? notifications[tag] : false

  if (notificationData && pathname.indexOf(notificationData.path) === -1) {
    toast.info(({ closeToast }) => getNotification(notificationData, closeToast), {
      position: toast.POSITION.BOTTOM_RIGHT,
      autoClose: notificationData.autoClose ? notificationData.autoClose : false,
      closeButton: false
    })
  } else {
    toast.info(({ closeToast }) => getNotification(notification, closeToast), {
      position: toast.POSITION.BOTTOM_RIGHT,
      closeButton: false
    })
  }
}

const getNotification = (notification, closeToast) => {
  if (notification.getNotification) {
    return notification.getNotification(notification, closeToast)
  }
  return <NotificationToast notification={notification} closeToast={closeToast} />
}

const checkForUpdate = () => {
  if (window.updateAvailable && !updateMessageShown) {
    updateMessageShown = true
    toast.info(
      ({ closeToast }) => <UpdateToast handleUpdate={handleUpdate} closeToast={closeToast} />,
      { position: toast.POSITION.BOTTOM_CENTER, autoClose: false, closeButton: false }
    )
  }
}

function handleUpdate () {
  window.updateAvailable = false
  // eslint-disable-next-line no-self-assign
  window.location.href = window.location.href
}

export { initializeMessaging, checkForUpdate }
