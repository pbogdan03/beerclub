# Beerclub

### [>>>>> LINK HERE <<<<<](https://quiet-fortress-1367.herokuapp.com/)

## Setup online environment

### Github

1. Create new repo on github.com
2. `git init` or `git clone` using **Github** settings on local machine
3. Create *README.md*

### Heroku

1. Create new **Heroku** app with `heroku create`
2. Connect with **Github** from *Dashboard*
3. `git push heroku master`

---------------------------------

## Server setup

### Setup basic Node.js - Express server

1. Create *server.js*
2. Import express module
3. Set port 3000 or use from environment variables
4. Create error and index page
5. Start the server using the port and log something to the console

### Setup basic views

1. `npm install --save express-handlebars` or **EJS** or **Jade**
2. Require the new resource and set the app view engine to **Handlebars** 
3. Create *views/error.handlebars* and *views/index.handlebars* views
4. Refactor the server side routes to render the newly created views

### Connect with MongoLab

1. `npm install --save mongoose` and require it
2. Connect to mongolab
3. Create *Beer* and *User* schema
4. Create and export *Beer* and *User* models from module.

### Setup environment variables

1. `npm install --save dotenv`
2. Create *env.json* to store all private variables and add it to *.gitignore*
3. Add necessary environment variables to **Heroku**

### Save beers to DB

1. Create beer model with data from **Instagram** and **Untappd** and populate the *createdBy* field with user data
2. Save beer to DB if it doesn't already exist
3. Update user model to store references to beers

### Setup local API to work with Instagram

1. Create */api/posts* to get all beer posts from DB
2. Create */api/users* to get all users from DB

### Refactor usign ES6 promises

1. Change all the API calls to use promises instead of callbacks
2. Chain promises and be careful what each returns

### Setup error handling

1. 

---------------------------------

## Register with Instagram API

1. Install **Passport** to authenticate with **Instagram**
2. Pass the *access_token* when available and store it to be used with the API
3. Change the **Instagram Strategy** to work with the database, by storing the user in the database and changing the serialize and deserialize user functions
4. GET user posts from **Instagram** after authentication

## Register with Untappd API

1. GET beers using **Instagram** beer title
2. GET beer info like description and rating using beer ID from first search

---------------------------------

## Setup Gulp

1. `npm install --save-dev gulp` and related plugins for nodemon, sass, autoprefixer, load-plugins, size etc.
2. Setup *nodemon* to watch for changes and reload the server on port 3000
3. `npm install --save-dev tiny-lr` and setup the *livereload* server to send and watch changes on file change
4. `npm install --save-dev connect-livereload` to inject the *livereload* script that listens to changes, on the necessary client html pages
5. `npm install --save-dev vinyl-source-stream` to use with browserify
6. `npm install --save-dev vinyl-buffer` to apply transformations to the vinyl stream
7. `npm install --save-dev gulp-uglify gulp-autoprefixer gulp-sass gulp-useref` and create tasks for css, js, and html files

---------------------------------

## Client setup

### Initial setup

1. Create *index.html* in the public folder to be served by **Express**
2. Add script tags for the necessary dependencies in the page
3. Create *scripts/index.js*
4. Create a *Beer* model and a *BeerView* as well as a *Beers* collection and *BeersView*

### Use modules on client side

1. `npm install --save-dev browserify` and use it to require *beer* model module and *beer-view* module
2. `npm install backbone --save` to use backbone model on client side
3. `npm install jquery --save` to use jquery model on client side
4. `npm install underscore --save` to use underscore model on client side





