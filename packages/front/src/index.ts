import React from 'react'
import * as R from 'ramda'

//import './theme/status-colors.scss';
import configureAdminStore from './store/configureFrontendStore';
import rootFrontSaga from './sagas/rootFrontSaga';
import {history} from '@sha/router';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import App from './components/app/App'
import {ducks} from 'iso/src/store'

window['ducks'] = ducks

window['axios'] = axios


const div = document.getElementById('root') as HTMLDivElement

const store = configureAdminStore()
store.runSaga(rootFrontSaga, store, history)

window['store'] = store
window['R'] = R

const root = ReactDOM.createRoot(
    document.getElementById("root")
);
root.render(React.createElement(App, {store}));


