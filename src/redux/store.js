import { createStore, combineReducers } from 'redux';

import info from './info';

const appReducers = combineReducers({
    info: info,
});

export default createStore(appReducers);