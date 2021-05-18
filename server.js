const express = require('express');
const fs      = require('fs');
const path    = require('path');
const pug     = require('pug');
const mongoose = require('mongoose');
const session = require('express-session');

//sets a new mongodb collection named 'sessiondata'
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/a4',
  collection: 'sessiondata'
});

const app = express();
const PORT = 3000;

//set template engine
app.set("view engine", "pug");

//connect mongoose to mongodb
mongoose.connect('mongodb://localhost:27017/a4', {useNewUrlParser: true});
let db = mongoose.connection;
let User = require('./models/user');

//logger middleware
const logger = (req, res, next) => {
  let url = req.url;
  let method = req.method;
  console.log(`${method}: ${url}`);
  next();
};

app.use(logger);
app.use(session({ secret: 'some secret here', store: store }));

//use static folder
app.use(express.static('public'));

//body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// '/register' router
let registerRouter = require('./register-router');
app.use('/register', registerRouter);

// '/users' router
let usersRouter = require('./users-router');
app.use('/users', usersRouter);

// '/orders' router
let ordersRouter = require('./orders-router');
app.use('/orders', ordersRouter);

const renderIndex = pug.compileFile('views/pages/index.pug');
const renderOrderForm = pug.compileFile('views/pages/orderform.pug');

//route for the homepage
app.get("/", (req, res) => {
  let user = req.session;
  let data = renderIndex({user});
  res.statusCode = 200;
  res.send(data);
});

app.post("/login", loginClient);

app.get("/logout", logoutClient);

//route for orderform
app.get("/orderform", (req, res) => {
  let user = req.session;
  let data = renderOrderForm({user});
  res.statusCode = 200;
  res.send(data);
});

//serves client-side javascript
app.get("/orderform/orderform.js", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/orderform.js"));
});

//logs the client in and will redirect to home page if already logged in
function loginClient(req, res, next) {
  if(req.session.loggedin){
    res.redirect("/");
    return;
  }
  let username = req.body.name;
  let password = req.body.password;
  //finds the user with username and password given through
  //post form in header.pug
  User.find({username: req.body.name}, (err, result) => {
    if(err) throw err;
    if(result == false || result[0].password !== req.body.password) {
      return res.status(400).send('<h1>Error 400: username or password is incorrect</h1>');
    }else{
      result = result[0];
      req.session.loggedin = true;
      req.session.username = username;
      req.session.user = result;
      res.redirect("/");
    }
  });
}

//logs the client out
function logoutClient(req, res, next){
	if(req.session.loggedin){
		req.session.loggedin = false;
		res.redirect("/");
	}
}

//app is listening on port 3000
app.listen(3000, () => {
  console.log(`app is listening on port ${PORT}...`);
});
