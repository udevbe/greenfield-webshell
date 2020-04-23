import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DrawerState {
  mobileOpen: boolean
  open: boolean
  useMinified: boolean
  drawerPath: string[]
}

const initialState: DrawerState = {
  mobileOpen: false,
  open: false,
  useMinified: false,
  drawerPath: [],
}

const reducers = {
  setDrawerOpen: (state: DrawerState, action: PayloadAction<boolean>) => {
    state.open = action.payload
    if (state.open) {
      state.useMinified = false
    }
  },

  setDrawerMobileOpen: (state: DrawerState, action: PayloadAction<boolean>) => {
    state.mobileOpen = action.payload
  },

  setDrawerUseMinified: (
    state: DrawerState,
    action: PayloadAction<boolean>
  ) => {
    state.useMinified = action.payload
    state.open = false
  },

  pushDrawerPath: (state: DrawerState, action: PayloadAction<string>) => {
    state.drawerPath.push(action.payload)
  },

  popDrawerPath: (state: DrawerState) => {
    state.drawerPath.pop()
  },

  setDrawerPath: (state: DrawerState, action: PayloadAction<string[]>) => {
    state.drawerPath = action.payload
  },
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/drawer',
})

export const {
  setDrawerMobileOpen,
  setDrawerOpen,
  pushDrawerPath,
  popDrawerPath,
  setDrawerPath,
  setDrawerUseMinified,
} = slice.actions
export default slice.reducer
