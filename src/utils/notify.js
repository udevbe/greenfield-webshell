import { toast } from 'react-toastify'

export function notifySuccess (message) {
  toast.success(
    message,
    { className: 'toast-success' }
  )
}

export function notifyInfo (message) {
  toast.info(
    message,
    { className: 'toast-info' }
  )
}

export function notifyWarn (message) {
  toast.warn(
    message,
    { className: 'toast-warn' }
  )
}

export function notifyError (message) {
  toast.error(
    message,
    { className: 'toast-error' }
  )
}
