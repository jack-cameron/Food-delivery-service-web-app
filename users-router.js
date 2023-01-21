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
const renderUsers = pug.compileFile('views/pages/users.pug');

router.get("/", loadUsers);
router.get("/:id", loadProfile);
router.post("/:id", updProfile);

function loadUsers(req, res, next) {
  let list = [];
  let user = req.session;
  //finds all users in users collection
  if(req.query.name) {
    User.find({username: {$regex:".*" + req.query.name+".*"}}, (err, result) => {
      if(err) throw err;
      userList = result;
      let data = renderUsers({user: user}, {userList: userList});
      res.status(200);
      res.send(data);
    });
  } else{
    User.find({}, (err, result) => {
      if(err) throw err;
      userList = result;
      let data = renderUsers({user: user}, {userList: userList});
      res.status(200);
      res.send(data);
    });
  }

}

//loads profile by using id in params
function loadProfile(req, res, next) {
  let profile = {};
  let user = req.session;
  //finds user with specifies id through params
  User.findOne({_id: req.params.id}, (err, result) => {
    if(err) throw err;
    profile = result;
    /*prevents acces if a profile that is private is
      attempting be accesed by another user, or someone who
      isn't logged in*/
    if(profile.privacy && (req.session.username !== profile.username) || profile.privacy && !req.session.loggedin) {
      return res.status(404).send('<h1>Error 404: you do not have access to this profile</h1>');
    }
    //render user.pug with the correct user
    res.render("./pages/user", {
      user: user,
      profile: profile
    });
  });
}

//updates a profile's privacy mode
function updProfile(req, res, next) {
  if(req.body.privacy == "on") {
    User.findOne({_id: req.params.id}, (err, result) => {
      if(err) throw err;
      if(!result) {
        return res.status(404).send('<h1>Error 404: user does not exist</h1>');
      }
    }).updateOne({privacy: true}, () => {
      res.redirect(`/users/${req.params.id}`);
    });
  }
  if(req.body.privacy == "off") {
    User.findOne({_id: req.params.id}, (err, result) => {
      if(err) throw err;
      if(!result) {
        return res.status(404).send('<h1>Error 404: user does not exist</h1>');
      }
    }).updateOne({privacy: false}, () => {
      res.redirect(`/users/${req.params.id}`);
    });
  }
}
module.exports = router;
