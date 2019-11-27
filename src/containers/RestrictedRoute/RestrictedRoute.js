import React from 'react'
import { Redirect, Route, useLocation } from 'react-router'
import { isEmpty } from 'react-redux-firebase'
import { useStore } from 'react-redux'
import { isAuthorised } from '../../utils/auth'

export const RestrictedRoute = ({
  type,
  component: Component,
  componentProps,
  ...rest
}) => {
  const location = useLocation()
  const authEmpty = isEmpty(useStore().getState().firebase.auth)
  const authorized = isAuthorised() && !authEmpty
  if (authorized || (type === 'public')) {
    return (
      <Route {...rest}>
        <Component {...componentProps} />
      </Route>
    )
  } else {
    return (
      <Redirect
        to={{
          pathname: '/signin',
          state: {
            fromRedirect: true,
            fromLocation: { ...location }
          }
        }}
      />
    )
  }
}

export default RestrictedRoute
