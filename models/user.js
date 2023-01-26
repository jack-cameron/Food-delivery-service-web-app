const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  privacy: {
    type: Boolean,
    required: true,
  },
  userLastCoordinatesLongitude: {
    type: String,
    required: false,
  },
  userLastCoordinatesLatitude: {
    type: String,
    required: false,
  },
  order: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
  ],
  user_type: {
    type: String,
    enum: ["user", "driver"],
  },
});

module.exports = User = mongoose.model("user", userSchema);
