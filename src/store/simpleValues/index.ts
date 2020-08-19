import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SimpleValue {
  id: string
  value: any
}

export type SimpleValueState = { [key: string]: any }

const initialState: SimpleValueState = {}

const reducers = {
  setSimpleValue(state: SimpleValueState, action: PayloadAction<SimpleValue>) {
    state[action.payload.id] = action.payload.value
  },
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/simplevalue',
})

export const { setSimpleValue } = slice.actions
export default slice.reducer
