import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ServiceWorkerState {
  registered: boolean
  canUpdate: boolean
  registration?: ServiceWorkerRegistration
  registrationUpdate?: ServiceWorkerRegistration
}

const initialState: ServiceWorkerState = {
  registered: false,
  canUpdate: false,
}

const reducers = {
  registrationSuccess: (state: ServiceWorkerState, action: PayloadAction<ServiceWorkerRegistration>) => {
    state.registered = true
    state.registration = action.payload
  },
  updateAvailable: (state: ServiceWorkerState, action: PayloadAction<ServiceWorkerRegistration>) => {
    state.canUpdate = true
    state.registrationUpdate = action.payload
  },
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/serviceworker',
})

export const { registrationSuccess, updateAvailable } = slice.actions

export default slice.reducer
