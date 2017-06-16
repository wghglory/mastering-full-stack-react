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

## Falcor's basic concepts

Falcor is like a glue between:

- Backend and its database structure (remember importing initData.js into MongoDB)
- Frontend Redux single state tree container

It glues the pieces in a way that is much more effective than building an old-fashioned REST API for a single-page application.

Like the Redux basic concepts section, in this one we will learn only the most basic concepts of Falcor and they will help us build a simple full-stack application in read-only mode. Later in the book, you will learn how to make an add/edit article with Falcor.

### What is Falcor and why do we need it in our full-stack publishing app?

It solves the problem of latency and tight coupling of backend to frontend.

### Tight coupling and latency versus one model everywhere

The old way of making requests to an API always forces you to tight-couple the backend API with frontend API utilities. It's always like that:

You make an API endpoint like https://applicationDomain.com/api/recordDetails?id=92.

You consume the data with HTTP API requests on the frontend:

```json
{ 
    id: '92', 
    title: 'example title', 
    content: 'example content' 
}
```

In large applications, it's hard to maintain real DRY RESTful APIs, and this problem causes plenty of endpoints that are not optimized, so the frontend sometimes has to do many round trips in order to fetch the data required for a certain view (and sometimes it fetches much more than it needs, which causes even more latency for the end user of our application).

Imagine that you have a large application with over 50 different API endpoints. After the first version of your application is finished, your client or boss finds a better way to structure the user flow in the app. What does this mean? That you have to work on changing both frontend and backend endpoints in order to satisfy the changes in the user interface layer. This is called tight coupling between frontend and backend.

What does Falcor bring to this situation to improve on those two areas that cause the inefficiency in working with RESTful APIs? The answer is `one model everywhere`.

It would be super easy to build your web applications if all your data was accessible in memory, on the client. Falcor provides utilities that help you feel that all your data is at your fingertips without coding backend API endpoints and client-side consuming utilities.

### No more tight coupling on client and server side

Falcor helps you represent all of your app's data as one virtual JSON model on the server.

When programming client side, Falcor makes you feel as if the whole JSON model of your application is reachable locally, and allows you to read data the same way as you would from an in-memory JSON.

Because of Falcor's library for browsers and the falcor-express middleware, you can retrieve your data from the model on-demand, from the cloud.

Falcor transparently handles all the network communication and keeps your client-side app in sync with the server and databases.

### Client-side Falcor

Let's install Falcor from NPM first:

```bash 
npm i --save falcor falcor-http-datasource
```

The `falcor-http-datasource` helps us to retrieve data from server to client side, out-of-the-box (without worrying about HTTP API requests)

Let's create our app's Falcor model on the client side: app/falcorModel.js

```javascript
import falcor from 'falcor';
import FalcorDataSource from 'falcor-http-datasource';

const model = new falcor.Model({
  source: new FalcorDataSource('/model.json')   // from backend
});

export default model;
```

Now we will fetch that data from the frontend Falcor's model in our "app/layouts/App.js" React component, we will add a new function called _fetch() which will be responsible for fetching all articles on our application start.

We need to import our Falcor model first, so at the top of the App.js file, we need to add the following:

```javascript
import falcorModel from '../falcorModel.js';
```

In our App class, we need to add the following two functions; componentWillMount and _fetch (more explanation follows):

```diff
import React from 'react';
import { connect } from 'react-redux';
+ import { bindActionCreators } from 'redux';
import articleActions from '../actions/article.js';
+ import falcorModel from '../falcorModel.js';

const mapStateToProps = (state) => ({
  ...state
});

const mapDispatchToProps = (dispatch) => ({
+  articleActions: bindActionCreators(articleActions, dispatch)
});

class App extends React.Component {
  constructor(props) {
    super(props);
  }

+  componentWillMount() {
+    this._fetch();
+  }
+
+  async _fetch() {
+    const articlesLength = await falcorModel.getValue('articles.length').then((length) => length);
+
+    const articles = await falcorModel.get([
+      'articles', {
+        from: 0,
+        to: articlesLength - 1
+      },
+      ['id', 'articleTitle', 'articleContent']
+    ]).then((articlesResponse) => {
+      console.log('articlesResponse: ' + articlesResponse);
+      return articlesResponse.json.articles
+    });
+
+    this.props.articleActions.articlesList(articles);
+  }

  render() {
    let articlesJSX = [];

    for (let articleKey in this.props) {
      const articleDetails = this.props[articleKey];
      const currentArticleJSX = (
        <div key={articleKey}>
          <h2>{articleDetails.articleTitle}</h2>
          <h3>{articleDetails.articleContent}</h3>
        </div>
      );

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

Here, you see the asynchronous function called `_fetch`. This is a special syntax that allows you to use the await keyword like we do when using `let articlesLength = await falcorModel` and `let articles = await falcorModel`.

Using async await over Promises means our code is more readable and avoids callback hell situations where nesting multiple callbacks one after the other makes code very hard to read and extend.

The async/await feature is taken from ECMAScript 7 inspired by C#. It allows you to write functions that appear to be blocked at each asynchronous operation that is waiting for the result before continuing to the next operation.

In our example, the code will execute as follows:

The get method on `falcorModel.get(['articles', {from: 0, to: articlesLength-1}, ['id','articleTitle', 'articleContent']])` is also an asynchronous operation (in the same way as http request). In the get method's parameter, we provide the location of our articles in our model (in app/falcorModel.js)

The array of `['id','articleTitle', 'articleContent']` says that you want those three properties out of every article.

After we have fetched the data from our Falcor model, we need to dispatch an action that will change the article's reducer accordingly and ultimately re-render our list of articles from our Falcor model from the const articleMock (in app/reducers/article.js) instead.

But before we will be able to dispatch an action, we need to do the following:

Create the app/actions/article.js:

```javascript
export default { 
  articlesList: (response) => { 
    return { 
      type: 'ARTICLES_LIST_ADD', 
      payload: { response: response } 
    } 
  } 
}
```

There isn't too much in that actions/article.js file. If you are familiar with FLUX already then it's very similar. One important rule for actions in Redux is that it has to be a pure function. For now, we will hardcode a constant called `ARTICLES_LIST_ADD` into actions/article.js.

Add articleActions: bindActionCreators(articleActions, dispatch) so that we are able to bind the articles' actions into our this.props component:

```javascript
const mapDispatchToProps = (dispatch) => ({ 
  articleActions: bindActionCreators(articleActions, dispatch) 
});
```

Thanks to the mentioned changes (articleActions: bindActionCreators(articleActions, dispatch)) in our component, we will be able to dispatch an action from props because now, when you use this.props.articleActions.articlesList(articles) then the articles object fetched from Falcor will be available in our reducer (and from there, there is only one step to make our app fetch data work).

Now, after you are done with these changes, add an action into our component in the _fetch function:

```javascript
this.props.articleActions.articlesList(articles);
```

At this point, we shall be able to receive an action in our Redux's reducer. Let's improve our app/reducers/article.js file:

```javascript
const article = (state = {}, action) => { 
    switch (action.type) { 
        case 'RETURN_ALL_ARTICLES': 
            return Object.assign({}, state); 
        case 'ARTICLES_LIST_ADD': 
            return Object.assign({}, action.payload.response); 
        default: 
            return state; 
    } 
} 
export default article
```

request: `http://localhost:3000/model.json?paths=[["articles",%20{"from":0,"to":1},["articleContent","articleTitle","id"]]]&method=get`

### Moving Falcor's model to the backend

The next important thing is to install new dependencies that are required for Falcor on the backend:

```
npm i --save falcor-express falcor-router
```

When you have finally installed new dependencies and configured the basic scripts for running the backend and frontend on the same port, then edit the server/server.js as follows:

1. On top of our file, import new libraries in the server/server.js:

    ```javascript
    import falcor from 'falcor'; 
    import falcorExpress from 'falcor-express';
    ```

1. Then between the following two:

    ```javascript
    app.use(bodyParser.json({extended: false})); 
    app.use(express.static('dist'));
    ```

1. Add new code for managing Falcor at the backend:

    ```javascript
    app.use(bodyParser.json({extended: false})); 

    let cache = { 
      articles: [ 
        { 
            id: 987654, 
            articleTitle: 'Lorem ipsum - article one', 
            articleContent: 'Here goes the content of the article' 
        }, 
        { 
            id: 123456, 
            articleTitle: 'Lorem ipsum - article two from          
            backend', 
            articleContent: 'Sky is the limit, the content goes          
            here.' 
        } 
      ] 
    }; 

    var model = new falcor.Model({ 
      cache: cache 
    }); 

    app.use('/model.json', falcorExpress.dataSourceRoute((req,               
    res) => { 
        return model.asDataSource(); 
    })); 
    app.use(express.static('dist'));
    ```

1. The preceding code is almost the same as the one in the app/falcorModel.js file. The only difference is that now Falcor will fetch data from the backend's mocked object, called cache in server.js.

1. You will see in your browser's dev tools a new HTTP request made by Falcor--for example, in our case:

![img](https://www.safaribooksonline.com/library/view/mastering-full-stack-react/9781786461766/assets/image_01_011.png)

If you follow all the instructions correctly, then you can also make a request to your server directly from your browser by executing this:

```
http://localhost:3000/model.json?paths=[["articles", {"from":0,"to":1},   
["articleContent","articleTitle","id"]]]&method=get
```

Then you shall see a jsonGraph in the response:

![img](https://www.safaribooksonline.com/library/view/mastering-full-stack-react/9781786461766/assets/image_01_012.png)

### Configuring Falcor's router (Express.js)

Currently, our model on the backend is hardcoded, so that it stays in the RAM memory of a server. We need to add the ability to read the data from our MongoDB's articles collection--this is where the falcor-router comes in handy.

Create server/routes.js file:

```javascript
const AppRoutes = [{ 
  route: 'articles.length', 
  get: () => { 
    const articlesCountInDB = 2; // hardcoded for example 
    return { 
      path: ['articles', 'length'], 
      value: articlesCountInDB 
    }; 
  } 
}]; 
export default AppRoutes;
```

As you can see, we have created our first route that will match the articles.length from our `_fetch` function (in layouts/App.js).

We have hardcoded the number two in articlesCountInDB, later we will make a query to our database there.

The new stuff here is route: 'articles.length', this is simply a route for matching by Falcor.

To be more precise, the Falcor routes' paths are exactly the same stuff that you have provided in your app/layouts/App.js (_fetch function) for example, to match this frontend call:

```javascript
 // location of that code snippet: app/layouts/App.js 
 const articlesLength = await falcorModel. 
    getValue('articles.length'). 
    then((length) => length);
```

- path: ['articles', 'length']: This property tells us Falcor's path (it's consumed by Falcor at the backend and frontend). We need to provide that because sometimes, one route can return many different objects as server articles (you will see it in the next route we create).
- value: articlesCountInDB: This is a return value. In this case, it is an integer number, but it can also be an object with several properties, as you will learn later.

### Second route for returning our two articles from the backend

Our second route (and last one in this chapter) will be the following:

```javascript
{ 
  route: 'articles[{integers}]["id","articleTitle","articleContent"]', 
  get: (pathSet) => { 
    const articlesIndex = pathSet[1]; 
    const articlesArrayFromDB = [{ 
    'articleId': '987654', 
    'articleTitle': 'BACKEND Lorem ipsum - article one', 
    'articleContent': 'BACKEND Here goes the content of the article' 
    }, { 
    'articleId': '123456', 
    'articleTitle': 'BACKEND Lorem ipsum - article two', 
    'articleContent': 'BACKEND Sky is the limit, the content goes here.' 
    }]; // That are our mocked articles from MongoDB 

    let results = []; 
    articlesIndex.forEach((index) => { 
      const singleArticleObject = articlesArrayFromDB[index]; 
      const falcorSingleArticleResult = { 
        path: ['articles', index], 
        value: singleArticleObject 
      }; 
      results.push(falcorSingleArticleResult); 
    }); 

    return results; 
  } 
}
```

The new thing in the second route is pathSet, if you log that into the console, then you will see, in our case (when trying to run our full-stack app) the following:

```javascript
[  
'articles', 
  [ 0, 1 ], 
  [ 'articleContent', 'articleTitle', 'id' ]  
]
```

pathSet tells us what indexes are requested from the client side ([ 0, 1 ], in our example).

Iterate over the requested indexes:

```javascript
let results = [];

articlesIndex.forEach((index) => { 
   const singleArticleObject = articlesArrayFromDB[index]; 
   const falcorSingleArticleResult = { 
     path: ['articles', index], 
     value: singleArticleObject 
   }; 
   results.push(falcorSingleArticleResult); 
 });
```

In the preceding code snippet, we iterate over an array of requested indexes (do you remember {from: 0, to: articlesLength-1} in PublishingApp.js?). Based on the indexes ([0, 1]) we fetch mocked data via const singleArticleObject = articlesArrayFromDB[index];. Later we put into the path and index (path: ['articles', index],) so Falcor knows to what path in our JSON graph object, the value singleArticleObject belongs to.

```javascript
[{ 
  path: ['articles', 0], 
  value: { 
    articleId: '987654', 
    articleTitle: 'BACKEND Lorem ipsum - article one', 
    articleContent: 'BACKEND Here goes the content of the article' 
  } 
}, { 
  path: ['articles', 1], 
  value: { 
    articleId: '123456', 
    articleTitle: 'BACKEND Lorem ipsum - article two', 
    articleContent: 'BACKEND Sky is the limit, the content goes here.' 
  } 
}]
```

### Final touch to make full-stack Falcor run

Currently, we still have mocked data in our routes, but before we start making calls to MongoDB, we need to wrap up the current setup so you will be able to see it running in your browser.

Open your server/server.js and make sure you import the following two things:

```javascript
import falcorRouter from 'falcor-router'; 
import routes from './routes.js';
```

Now that we have imported our falcor-router and routes.js--we need to use them, so modify this old code:

```javascript
// This is old code, remove it and replace with new 
app.use('/model.json', falcorExpress.dataSourceRoute((req, res) =>  { 
  return model.asDataSource(); 
}));
```

Replace the preceding code with:

```javascript
app.use('/model.json', falcorExpress.dataSourceRoute((req, res) => { 
 return new falcorRouter(routes); 
}));
```

This will work only when the falcor-router has been already installed and imported in the server.js file. This is a library for DataSource that creates a virtual JSON graph document on your app server. As you can see in server.js so far we have DataSource provided by our hardcoded model, return model.asDataSource();. The router here will make the same, but now you will be able to match routes based on your app requirements.

Also, as you can see, the new falcorRouter takes an argument of our routes `return new falcorRouter(routes)`.

On port 3000, you will see the following:

![img](https://www.safaribooksonline.com/library/view/mastering-full-stack-react/9781786461766/assets/image_01_013.png)