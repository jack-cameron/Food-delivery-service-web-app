if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const fs = require("fs");
const path = require("path");
const pug = require("pug");
const session = require("express-session");
const startdb = require("./config/db");
const cors = require("cors");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cookieParser = require("cookie-parser");
const PORT = 3000;
startdb();

//set template engine
app.set("view engine", "pug");

let User = require("./models/user");
const Orders = require("./models/order");
//logger middleware
const logger = (req, res, next) => {
  let url = req.url;
  let method = req.method;
  console.log(`${method}: ${url}`);
  next();
};

app.use(logger);
app.use(
  session({
    secret: "some secret here",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser());
app.use(cors());
//use static folder
app.use(express.static("public"));

//body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

io.on("connection", (socket) => {
  console.log("A client is connected: ");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("order.process", async (order) => {
    console.log("New order placed: ", order);
    // update the order_status to in_progress
    await Orders.updateOne(
      { _id: order["order_id"] },
      { status: "IN_PROGRESS" }
    );
    console.log("Order status updated");
  });

  socket.on("order.process.delivery", (order) => {
    // console.log("Ready for delivery: ", order);
    io.emit("order.delivery.in_progress", {
      order_id: order.order_id,
      driver_lat: order.latitude,
      driver_long: order.longitude,
    });
  });
});

// '/register' router
let registerRouter = require("./register-router");
app.use("/register", registerRouter);

// '/users' router
let usersRouter = require("./users-router");
app.use("/users", usersRouter);

// '/orders' router
let ordersRouter = require("./orders-router");
app.use("/orders", ordersRouter);

const renderIndex = pug.compileFile("views/pages/index.pug");
const renderOrderForm = pug.compileFile("views/pages/orderform.pug");

//route for the homepage
app.get("/", async (req, res) => {
  let user = req.session;
  const isDriver = user.user_type === "driver" ? true : false;
  res.cookie("isDriver", isDriver);
  // fetch all orders if user is driver
  let data;
  if (isDriver) {
    const pendingOrders = await Orders.find({ status: "PENDING" }).exec();
    data = renderIndex({ user, isDriver: isDriver, orders: pendingOrders });
  } else {
    data = renderIndex({ user, isDriver: isDriver });
  }

  res.statusCode = 200;
  res.send(data);
});

app.post("/login", loginClient);

app.get("/logout", logoutClient);

//route for orderform
app.get("/orderform", (req, res) => {
  let user = req.session;
  const isDriver = user.user_type === "driver" ? true : false;
  let data = renderOrderForm({ user, isDriver: isDriver });
  res.statusCode = 200;
  res.send(data);
});

//serves client-side javascript
app.get("/orderform/orderform.js", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/orderform.js"));
});

app.get("/orders/orderProcessor.js", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/orderProcessor.js"));
});

app.get("/orders/:id/orderProcessor.js", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/orderProcessor.js"));
});

//logs the client in and will redirect to home page if already logged in
function loginClient(req, res, next) {
  if (req.session.loggedin) {
    res.redirect("/");
    return;
  }
  let username = req.body.name;
  let password = req.body.password;
  //finds the user with username and password given through
  //post form in header.pug
  User.find({ username: req.body.name }, (err, result) => {
    if (err) throw err;
    if (result == false || result[0].password !== req.body.password) {
      return (
        res
          .status(400)
          // .redirect('/login')
          .send("<h1>Error 400: username or password is incorrect</h1>")
      );
    } else {
      result = result[0];
      req.session.loggedin = true;
      req.session.username = username;
      req.session.user = result;
      req.session.user_type = result.user_type;
      res.redirect("/");
    }
  });
}

//logs the client out
function logoutClient(req, res, next) {
  if (req.session.loggedin) {
    req.session.loggedin = false;
    res.redirect("/");
  }
}

//app is listening on port 3000
server.listen(3000, () => {
  console.log(`app is listening on port ${PORT}...`);
});
