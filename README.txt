COMP2406 Assignment#4
Jack Cameron - 101111927

to install:

npm install

to start:

node server.js

files included:
public
   /orderform.js
   /add.jpeg
   /remove.jpeg
views
   pages
      /index.pug
      /order.pug
      /orderform.pug
      /register.pug
      /user.pug
      /users.pug
   partials
      /header.pug
database-initializer.js
orders-router.js
package.json
README.txt (this file)
register-router.js
server.js
users-router.js


server.js:
this file supplies that requests for /login, /logout and /orderform. 
it also serves all static files.

Router explainations:

orders-router.js - 
all requests that begin with /orders are redirected to this js file.
this router is responsible for uploading orders to the data base and providing specific orders from users

register-router.js - 
a GET request to /register will provide the user with a form to create a username and password. a middleware function called userCheck in this file will ensure that it is a unique username. it will then create a new user with the specified username and password and upload it to the database.

users-router.js - 
all requests that begin with /users will be redirected to this js file.
this router is responsible for providing a list of all users, while also supporting query parameters. 
it will also ensure that no users who dont have access to certain profiles cannt access them.