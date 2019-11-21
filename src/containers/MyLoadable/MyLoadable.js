import React from 'react'
import Loadable from 'react-loadable'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import { ReactReduxContext } from 'react-redux'

export default (opts, preloadComponents) => Loadable.Map({
  loader: {
    Component: opts.loader,
    firebase: opts.firebase
  },
  loading: LoadingComponent,
  render (loaded, props) {
    if (preloadComponents !== undefined && preloadComponents instanceof Array) {
      preloadComponents.map(component => component.preload())
    }

    const Component = loaded.Component.default
    const firebase = loaded.firebase

    return (
      <ReactReduxContext.Consumer>
        {({ store }) => {
          return (
            <ReactReduxFirebaseProvider
              firebase={firebase}
              config={{ userProfile: 'users' }}
              dispatch={store.dispatch}
            >
              <div>
                <Component {...props} />
              </div>
            </ReactReduxFirebaseProvider>
          )
        }}
      </ReactReduxContext.Consumer>
    )
  }
})
