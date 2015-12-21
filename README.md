# Beerclub

### [>>>>> LINK HERE <<<<<](https://quiet-fortress-1367.herokuapp.com/)

## Setup online environment

### Github

1. Create new repo on github.com
2. `git init` or `git clone` using __Github__ settings on local machine
3. Create *README.md*

### Heroku

1. Create new __Heroku__ app with `heroku create`
2. Connect with __Github__ from *Dashboard*
3. `git push heroku master`

## Setup basic Node.js - Express server

1. Create *server.js*
2. Import express module
3. Set port 3000 or use from environment variables
4. Create 404 page
5. Create 500 page
6. Start the server using the port and log something to the console

## Setup some views

1. `npm install --save express-handlebars` or __EJS__ or __Jade__
2. Require the new resource and set the app view engine to __Handlebars__ 
3. Create *views/layouts/main.handlebars* and *views/{404, 500, home}.handlebars* views
4. Refactor the server side routes to render the newly created views

## Connect with MongoLab

1. `npm install --save mongoose` and require it
2. Connect to mongolab
3. Create *User* and *Beer* schemas
4. Create a user and save it to db if it does not exist

## Setup environment variables

1. Create *env.json* to store all private variables and add it to *.gitignore*
2. Add necessary environment variables to __Heroku__

## Register with Instagram API

## Register with Untappd API





