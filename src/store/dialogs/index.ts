import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DialogsState {
  [key: string]: boolean
}

const initialState: DialogsState = {}

const reducers = {
  updateDialog(
    state: DialogsState,
    action: PayloadAction<{ id: string; open: boolean }>
  ) {
    state[action.payload.id] = action.payload.open
  },
}

const slice = createSlice({
  reducers,
  initialState,
  name: 'greenfield/dialogs',
})

export const { updateDialog } = slice.actions
export default slice.reducer
