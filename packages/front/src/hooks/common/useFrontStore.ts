import {useStore} from 'react-redux'
import {FrontState} from '../../store/frontReducer'
import {ListenableStore} from '../middlewares/listenActionEnhancer'
import {Store} from 'redux'


export type FrontStore = Store<FrontState> & ListenableStore<any, any, any>

export const useFrontStore: () => FrontStore = useStore as any

export default useFrontStore
