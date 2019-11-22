import React from 'react'
import Loadable from 'react-loadable'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'
import { FirebaseProvider } from '../App/FirebaseProvider'

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
      <div>
        <FirebaseProvider firebase={firebase}>
          <Component {...props} />
        </FirebaseProvider>
      </div>
    )
  }
})
