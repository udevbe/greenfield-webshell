import React from 'react'
import { Redirect, Route, useLocation } from 'react-router'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import { useSelector } from 'react-redux'

export const RestrictedRoute = ({
  type,
  component: Component,
  componentProps,
  ...rest
}) => {
  const location = useLocation()
  const isAuthorized = useSelector(({ firebase: { auth } }) => isLoaded(auth) && !isEmpty(auth))
  if (isAuthorized || (type === 'public')) {
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
