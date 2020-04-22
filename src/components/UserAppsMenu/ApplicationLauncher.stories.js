import React from 'react'
import { action } from '@storybook/addon-actions'

import { ApplicationLauncher } from './ApplicationLauncher'

const application = {
  appIconURL: 'https://source.unsplash.com/random',
  appTitle: 'Test Application',
  appId: 'abc',
}

const actions = {
  onLaunchApplication: action('onLaunchApplication'),
}

export default {
  component: ApplicationLauncher,
  title: 'ApplicationLauncher',
}
export const userApplication = () => (
  <ApplicationLauncher application={application} {...actions} />
)
