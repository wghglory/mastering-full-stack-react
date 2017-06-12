## Importing the articles json file to MongoDB

```bash
use master-full-stack-react   # create db

mongoimport --db master-full-stack-react --collection articles --jsonArray data/initData.js --host=127.0.0.1   # import json data to mongodb
```

## Working on server

#### server/server.js

```javascript
import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/master-full-stack-react');

const articleSchema = {
  articleTitle: String,
  articleContent: String
};

const Article = mongoose.model('Article', articleSchema, 'articles');
const app = express();
app.server = http.createServer(app);

// CORS - 3rd party middleware 
app.use(cors());

// This is required by falcor-express middleware to work correctly  
//with falcor-browser 
app.use(bodyParser.json({ extended: false }));

app.use(express.static('dist'));

app.get('/', (req, res) => {
  Article.find((err, articlesDocs) => {
    const ourArticles = articlesDocs.map((articleItem) => {
      return `<h2>${articleItem.articleTitle}</h2> 
        ${articleItem.articleContent}`;
    }).join('<br/>');

    res.send(`<h1>Publishing App Initial Application!</h1>
      ${ourArticles}`);
  });
});

app.server.listen(process.env.PORT || 3000);
console.log(`Started on port ${app.server.address().port}`);
export default app;
```

#### server/index.js

```javascript
require('babel-core/register');   // to make import work in node
// require('babel-polyfill'); 
require('./server');
```

## Working on react client with redux

#### reducers/articles.js

```javascript
const articleMock = {
  '987654': {
    articleTitle: 'Lorem ipsum - article one',
    articleContent: 'Here goes the content of the article'
  },
  '123456': {
    articleTitle: 'Lorem ipsum - article two',
    articleContent: 'Sky is the limit, the content goes here.'
  }
};

const article = (state = articleMock, action) => {
  switch (action.type) {
    case 'RETURN_ALL_ARTICLES':
      // return Object.assign({}, state);
      return [...state];
    default:
      return state;
  }
}
export default article;
```

#### index.js

```jsx
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
```

#### layouts/App.js

```jsx
import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = (state) => ({
  ...state
});

const mapDispatchToProps = (dispatch) => ({
});

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let articlesJSX = [];

    for (let articleKey in this.props) {
      const articleDetails = this.props[articleKey];
      const currentArticleJSX = (
        <div key={articleKey}>
          <h2>{articleDetails.articleTitle}</h2>
          <h3>{articleDetails.articleContent}</h3>
        </div>);

      articlesJSX.push(currentArticleJSX);
    }

    return (
      <div>
        <h1>Our publishing app</h1>
        {articlesJSX}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

