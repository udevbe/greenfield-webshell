import React from 'react'
import { Redirect, Route } from 'react-router'
import { useIsAuthenticated } from '../../utils/auth'
import { useSelector } from 'react-redux'

export const RestrictedRoute = React.memo(({ type, ...rest }) => {
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
})

export default RestrictedRoute
