import React, { FunctionComponent } from 'react'
import { useSelector } from 'react-redux'
import { Redirect, Route, RouteProps } from 'react-router'
import { useIsAuthenticated } from '../../utils/auth'

export const RestrictedRoute: FunctionComponent<{ type?: 'public' | 'private' } & RouteProps> = ({ type, ...rest }) => {
  const pathname = useSelector(({ router }) => router.location.pathname)
  const authorized = useIsAuthenticated()
  if (authorized || type === 'public') {
    return <Route {...rest} />
  } else {
    return (
      <Redirect
        to={{
          pathname: '/signin',
          state: {
            fromRedirect: true,
            fromLocation: pathname,
          },
        }}
      />
    )
  }
}

export default React.memo(RestrictedRoute)
