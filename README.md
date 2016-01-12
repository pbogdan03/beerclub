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
4. Create error and index page
5. Start the server using the port and log something to the console

## Setup some views

1. `npm install --save express-handlebars` or __EJS__ or __Jade__
2. Require the new resource and set the app view engine to __Handlebars__ 
3. Create *views/error.handlebars* and *views/index.handlebars* views
4. Refactor the server side routes to render the newly created views

## Connect with MongoLab

1. `npm install --save mongoose` and require it
2. Connect to mongolab
3. Create *Beer* and *User* schema
4. Create and export *Beer* and *User* models from module.

## Setup environment variables

1. Create *env.json* to store all private variables and add it to *.gitignore*
2. Add necessary environment variables to __Heroku__

## Register with Instagram API

1. Install **Passport** to authenticate with **Instagram**
2. Pass the *access_token* when available and store it to be used with the API
3. Change the **Instagram Strategy** to work with the database, by storing the user in the database and changing the serialize and deserialize user functions
4. Make a call to **Instagram API** and store it in DB

### Setup local API to work with Instagram

1. Create */api/posts* to get all logged in user beer posts

## Register with Untappd API

## Setup Gulp

1. `npm install --save-dev gulp` and related plugins for nodemon, sass, autoprefixer, load-plugins, size etc.
2. Setup *nodemon* to watch for changes and reload the server on port 3000
3. `npm install --save-dev tiny-lr` and setup the *livereload* server to send and watch changes on file change
4. `npm install --save-dev connect-livereload` to inject the *livereload* script that listens to changes, on the necessary client html pages

### Backbone

## Initial setup

1. Create *index.html* in the public folder to be served by **Express**
2. Add script tags for the necessary dependecies in the page
3. Create *scripts/index.js*
4. Create a *Beer* model and a *BeerView* as well as a *Beers* collection and *BeersView*





