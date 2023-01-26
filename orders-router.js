const express = require("express");
const fs = require("fs");
const path = require("path");
const pug = require("pug");
const mongoose = require("mongoose");
const session = require("express-session");

//sets a new mongodb collection named 'sessiondata'
// const MongoDBStore = require("connect-mongodb-session")(session);
// const store = new MongoDBStore({
//   uri: `${process.env.MONGO_URI}/a4`,
//   collection: "sessiondata",
// });

let router = express.Router();

// //connect mongoose to mongodb
// mongoose.connect(`${process.env.MONGO_URI}/a4`, { useNewUrlParser: true });
// let db = mongoose.connection;
let User = require("./models/user");
let Order = require("./models/order");

router.post("/", createOrders);
router.get("/", loadOrders);
router.get("/:id/deliveryInfo", loadOrderDeliveryInfo);


/*extracts order object from XML post request from the client-side
  and creates a new Order object to add to the database*/
function createOrders(req, res, next) {
  let count = 0;
  let u = {};
  User.findOne({ username: req.session.username }, (err, result) => {
    if (err) throw err;
    if (!result) {
      return res.status(404).send("<h1>Error 404: user does not exist</h1>");
    }
    //create new order object with given data
    let order = new Order();
    order.restaurantID = req.body.restaurantID;
    order.restaurantName = req.body.restaurantName;
    order.subtotal = req.body.subtotal;
    order.total = req.body.total;
    order.fee = req.body.fee;
    order.tax = req.body.tax;
    order.person = req.session.username;
    for (key in req.body.order) {
      let item = {};
      item.quantity = req.body.order[key].quantity;
      item.name = req.body.order[key].name;
      order.order.push(item);
    }
    //save to database
    order.save((err, result) => {
      if (err) throw err;
    });
    result.order.push(order);
    result.save((err, result) => {
      if (err) throw err;
      res.send({ message: result });
    });
  });
}

//loads order history for users
function loadOrders(req, res, next) {
  let order;
  let user = req.session;
  const isDriver = (user.user_type === "driver") ? true : false;
  Order.findOne({ _id: req.query.order_id }, (err, result) => {
    if (err) throw err;
    let order = result;
    User.findOne({ username: order.person }, (err, result) => {
      if (err) throw err;
      /*prevents acces if a profile that is private is
        attempting be accesed by another user, or someone who
        isn't logged in*/
      if (
        (result.privacy == true && req.session.username !== result.username) ||
        (result.privacy == true && !req.session.loggedin)
      ) {
        return res
          .status(404)
          .send("<h1>Error 404: you do not have access to this</h1>");
      } else {
        res.render("./pages/order", {
          user: user,
          order: order,
          isDriver
        });
      }
    });
  });
}

function loadOrderDeliveryInfo(req, res, next) {
  let order;
  let user = req.session;
  const isDriver = (user.user_type === "driver") ? true : false;
  Order.findOne({ _id: req.params.id }, (err, result) => {
    if (err) throw err;
    let order = result;
    User.findOne({ username: order.person }, (err, result) => {
      if (err) throw err;
      /*prevents acces if a profile that is private is
        attempting be accesed by another user, or someone who
        isn't logged in*/
      if (
        (result.privacy == true && req.session.username !== result.username) ||
        (result.privacy == true && !req.session.loggedin)
      ) {
        return res
          .status(404)
          .send("<h1>Error 404: you do not have access to this</h1>");
      } else {
        res.render("./pages/delivery", {
          user: user,
          order: order,
          isDriver
        });
      }
    });
  });
}

module.exports = router;
