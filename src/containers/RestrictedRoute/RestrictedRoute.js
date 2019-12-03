import React from 'react'
import { Redirect, Route, useLocation } from 'react-router'
import { useIsAuthenticated } from '../../utils/auth'

export const RestrictedRoute = ({
  type,
  component: Component,
  componentProps,
  ...rest
}) => {
  const location = useLocation()
  const authorized = useIsAuthenticated()
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
