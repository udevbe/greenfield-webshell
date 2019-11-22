import React from 'react'
import { Redirect, Route } from 'react-router'
import { useFirebase } from 'react-redux-firebase'

export const RestrictedRoute = ({
  type,
  component: Component,
  fallbackComponent: FallbackComponent = false,
  ...rest
}) => {
  // FIXME use selector & display loading state if required
  const isAuthorised = useFirebase().auth.isAuthorised
  return (
    <Route
      {...rest}
      render={props => {
        if ((isAuthorised && type === 'private') || (!isAuthorised && type === 'public')) {
          return <Component {...props} />
        } else if (FallbackComponent) {
          return <FallbackComponent {...props} />
        } else {
          return (
            <Redirect
              to={{
                pathname:
                  type === 'private' ? '/signin' : props.location.state ? props.location.state.from.pathname : '/',
                search: `from=${props.location.pathname}`,
                state: { from: props.location }
              }}
            />
          )
        }
      }}
    />
  )
}

export default RestrictedRoute
