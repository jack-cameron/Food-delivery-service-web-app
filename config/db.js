const mongoose = require("mongoose");

async function startdb() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log("Databse Connected.");
  } catch(error) {
    console.log("Database failed to connect.", error.message)
  }
}

module.exports = startdb