import { SimpleValueState } from './index'

const getSimpleValue = (state: SimpleValueState, name: string, defValue: any) => {
  const { [name]: simpleValue = defValue } = state.simpleValues ? state.simpleValues : {}

  return simpleValue
}

export default getSimpleValue
