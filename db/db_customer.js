const mongoose = require("./db_main.js");
const loginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confornPassword: {
    type: String,
    required: true,
  },
});

const loginDbCustomer = new mongoose.model("loginDbCustomer", loginSchema);

const CartSchema = new mongoose.Schema({
  customerEmail: {
    type: String,
    required: true,
  },
  seller_email: {
    type: String,
    required: true,
  },
  Price: Number,
  flat_id: {
    type: String,
    required: true,
  },
});

const CartDbCustomer = new mongoose.model("CartDbCustomer", CartSchema);

module.exports = {
  loginDbCustomer,
  CartDbCustomer,
};
