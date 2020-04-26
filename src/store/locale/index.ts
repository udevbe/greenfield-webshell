import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LocaleState {
  locale: string
}

const initialState = {
  locale: 'en',
}

const reducers = {
  updateLocale(state: LocaleState, action: PayloadAction<string>) {
    state.locale = action.payload
  },
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/locale',
})

export const { updateLocale } = slice.actions
export default slice.reducer
