const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password : {
    type: String,
    required: true
  },
  privacy : {
    type: Boolean,
    required: true
  },
  order :  [{
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: false,
  }]
});

module.exports = User = mongoose.model('user', userSchema);
