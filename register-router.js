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

let router = express.Router();

//connect mongoose to mongodb
mongoose.connect('mongodb://localhost:27017/a4', {useNewUrlParser: true});
let db = mongoose.connection;
let User = require('./models/user');

//pug template(s)
const renderRegister = pug.compileFile('views/pages/register.pug');

//route for register
router.get('/', (req, res) => {
  let data = renderRegister();
  res.statusCode = 200;
  res.send(data);
});

router.post('/', userCheck, registerClient);

//creates a new user
function registerClient(req, res, next) {
  let user = new User();
  user.username = req.body.name;
  user.password = req.body.password;
  user.privacy = false;
  console.log(user);
  user.save((err, result) => {
		if(err){
			console.log(err);
			return res.status(500).send("Error creating user.");
		}
    console.log(result);
    req.session.loggedin = true;
    req.session.username = req.body.name;
    req.session.user = user;
		res.redirect("/");
    next();
	});
}

/*before a new user is saved to the data base, this middleware
  function is excecuted to make sure the client provided a unique username
  and password. */
function userCheck(req, res, next) {
  let user = new User();
  user.username = req.body.name;
  user.password = req.body.password
  console.log(user);
  User.find({username: req.body.name}, (err, result) => {
    if(err) throw err;
    if(result.length > 0) {
      return res.status(400).send('<h1>Error 400: that username is taken</h1>');
    }
    //only continues to next() if results are empty
    next();
  });
}

module.exports = router;
