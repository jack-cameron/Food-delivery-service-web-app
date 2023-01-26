const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  restaurantID: {
    type: Number,
    required: true
  },
  person: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "DELIVERED", "IN_PROGRESS"],
    default: "PENDING"
  },
  restaurantName: {
    type: String,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  order: [{
    type:Object
  }]
});

module.exports = Order = mongoose.model('order', orderSchema);
