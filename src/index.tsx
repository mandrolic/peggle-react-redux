import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Store, createStore  } from 'redux'; // compose, applyMiddleware
import { Provider } from 'react-redux';
import { Reducer } from 'redux';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { install } from 'redux-loop';

import rootReducer from './rootReducer';
const initialState = {};

const store: Store<{} | undefined> = createStore(rootReducer as Reducer<{}>, initialState, install());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);

registerServiceWorker();
