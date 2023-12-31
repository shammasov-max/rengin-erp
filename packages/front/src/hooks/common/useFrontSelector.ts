import {TypedUseSelectorHook, useSelector} from 'react-redux'
import {FrontState} from '../../store/frontReducer'

export const useFrontSelector: TypedUseSelectorHook<FrontState> = useSelector
export const useFrontStateSelector = () => useFrontSelector(state => state)

export default useFrontSelector
