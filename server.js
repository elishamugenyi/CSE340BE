/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/

//Require the session package and DB connection in the 2 statements below
const session = require ("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser")// add body-parser to require statements

const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/index")
const accountRoute = require("./routes/accountRoute") //enable account Route 
const errorHandler = require("./middleware/errormiddleware")//addded error handler to be used.
const errorRoute = require("./routes/errorRoute") //addind route to serve application

/* *******
* Middleware
//added this code here to handle expression session
* **********/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing:true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

//These will make body-parser available, still part of middleware.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true})) //for parsing application/x-www-form-urlencoded


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/

//index route
app.get("/", baseController.buildHome)

app.use("/inv", inventoryRoute)//added new invetoryRoute i created in invetoryRoute file
app.use("/account", accountRoute) //use accountRoute in route section
app.use(static)

//add intentional error route to application
app.use('/', errorRoute)
//add the error handler middleware at the end of all routes
app.use(errorHandler)

/*
app.get("/", function(req, res){
  res.render("index", {title: "Home"})
}) */

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${JSON.stringify(err)}`)
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav,
    layout: false //bypassing layout for the error page
  })
})

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  let nav = await utilities.getNav();
  res.status(404).render('errors/error', {
    title: '404 - Page Not Found',
    message: 'Sorry, we appear to have lost that page.',
    nav,
    layout: false
  })
  //next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})
/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
