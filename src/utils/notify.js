import { showNotification } from '../store/notification'
import { useDispatch } from 'react-redux'

export const useNotifySuccess = () => {
  const dispatch = useDispatch()
  return (message) =>
    dispatch(showNotification({ variant: 'success', message }))
}
export const useNotifyInfo = () => {
  const dispatch = useDispatch()
  return (message) => dispatch(showNotification({ variant: 'info', message }))
}
export const useNotifyWarn = () => {
  const dispatch = useDispatch()
  return (message) => dispatch(showNotification({ variant: 'warn', message }))
}
export const useNotifyError = () => {
  const dispatch = useDispatch()
  return (message) => dispatch(showNotification({ variant: 'error', message }))
}
