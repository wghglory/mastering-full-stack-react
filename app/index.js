import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import article from './reducers/article';
import App from './layouts/App';

// bootstrap core. specific plugin like jumbotron is imported in needed component.
import './bootstrap/_core.scss';
import './index.scss';

const store = createStore(article);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
