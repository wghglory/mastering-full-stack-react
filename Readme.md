# Mastering full stack react

## Importing the articles to MongoDB

```bash
use master-full-stack-react

mongoimport --db master-full-stack-react --collection articles --jsonArray data/initData.js --host=127.0.0.1
```

## Start project 

```bash
mongod   # start mongodb server
npm start
```