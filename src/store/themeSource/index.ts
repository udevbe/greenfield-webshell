import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ThemeSourceState {
  themeId: string
  nightMode: boolean
}

const initialState = {
  themeId: 'default',
  nightMode: false,
}

const reducers = {
  updateTheme(state: ThemeSourceState, action: PayloadAction<{ themeId: string; nightMode: boolean }>) {
    ;({ nightMode: state.nightMode, themeId: state.themeId } = action.payload)
  },
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/themeSource',
})

export const { updateTheme } = slice.actions
export default slice.reducer
