import * as types from './types'
import SplitterObject from './splitter-object'
import create from './create'
export const fromIterable = (data: types.Data): SplitterObject => create({ data })
export default fromIterable
